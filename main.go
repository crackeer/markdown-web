package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/caarlos0/env/v6"
	ginHelper "github.com/crackeer/gopkg/gin"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	_ "github.com/joho/godotenv/autoload"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// AppConfig
type AppConfig struct {
	Port                 int64    `env:"PORT"`
	Database             string   `env:"DATABASE"`
	CodeLanguage         []string `env:"CODE_LANGUAGE" envSeparator:","`
	UserProfileDirectory string   `env:"USER_PROFILE_DIRECTORY"`
}

var (
	globalDB *gorm.DB
	cfg      *AppConfig
	tokenKey string = "token"
)

func main() {
	cfg = &AppConfig{}
	if err := env.Parse(cfg); err != nil {
		panic(err)
	}
	if db, err := open(cfg.Database); err != nil {
		panic(err)
	} else {
		globalDB = db
	}
	router := gin.New()
	router.POST("/login", ginHelper.DoResponseJSON(), Login)
	router.RedirectFixedPath = false
	router.RedirectTrailingSlash = false
	wrapperRouter := router.Group("", checkAPILogin, ginHelper.DoResponseJSON())
	wrapperRouter.GET("/user", getUser)
	wrapperRouter.POST("/delete/:table/:id", deleteData)
	wrapperRouter.POST("/create/:table", createData)
	wrapperRouter.POST("/modify/:table/:id", modifyData)
	wrapperRouter.GET("/query/:table", queryData)
	wrapperRouter.GET("/distinct/:table/:colum", distinctData)
	wrapperRouter.GET("/code/language", func(ctx *gin.Context) {
		ginHelper.Success(ctx, cfg.CodeLanguage)
	})
	router.Use(checkLogin)
	router.NoRoute(createStaticHandler(http.Dir("./resources")))
	router.Run(fmt.Sprintf(":%d", cfg.Port))
}

func open(connection string) (*gorm.DB, error) {
	if strings.HasPrefix(connection, "mysql://") {
		return gorm.Open(mysql.Open(connection[8:]), &gorm.Config{})
	}

	if strings.HasPrefix(connection, "sqlite://") {
		return gorm.Open(sqlite.Open(connection[9:]), &gorm.Config{})
	}

	return nil, errors.New("not support")
}

func createStaticHandler(fs http.FileSystem) gin.HandlerFunc {
	fileServer := http.StripPrefix("", http.FileServer(fs))
	return func(ctx *gin.Context) {
		file := strings.TrimLeft(ctx.Request.URL.Path, "/")
		f, err := fs.Open(file)
		if err != nil {
			ctx.Writer.WriteHeader(http.StatusNotFound)
			ctx.Abort()
			return
		}
		f.Close()
		fileServer.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

func getTable(ctx *gin.Context) string {
	return ctx.Param("table")
}

func getColum(ctx *gin.Context) string {
	return ctx.Param("colum")
}

func getDataID(ctx *gin.Context) int64 {
	id := ctx.Param("id")
	value, _ := strconv.Atoi(id)
	return int64(value)
}

type Markdown struct {
	ID       int64     `json:"id"`
	Title    string    `json:"title"`
	Content  string    `json:"content"`
	Category string    `json:"category"`
	CreateAt time.Time `json:"create_at"`
	ModifyAt time.Time `json:"modify_at"`
}

func (Markdown) TableName() string {
	return "markdown"
}

type Bookmark struct {
	ID       int64     `json:"id"`
	Title    string    `json:"title"`
	Link     string    `json:"link"`
	Category string    `json:"category"`
	CreateAt time.Time `json:"create_at"`
	ModifyAt time.Time `json:"modify_at"`
}

func (Bookmark) TableName() string {
	return "bookmark"
}

type Code struct {
	ID       int64     `json:"id"`
	Title    string    `json:"title"`
	Content  string    `json:"content"`
	Language string    `json:"language"`
	CreateAt time.Time `json:"create_at"`
	ModifyAt time.Time `json:"modify_at"`
}

func (Code) TableName() string {
	return "code"
}

func deleteData(ctx *gin.Context) {
	if dataID := getDataID(ctx); dataID < 1 {
		ginHelper.Failure(ctx, -1, "data id = 0")
		return
	}
	result := globalDB.Exec(fmt.Sprintf("DELETE FROM %s where id = %d", getTable(ctx), getDataID(ctx)))
	if result.Error != nil {
		ginHelper.Failure(ctx, -1, result.Error.Error())
	} else {
		ginHelper.Success(ctx, map[string]interface{}{
			"affected": result.RowsAffected,
		})
	}
}

func createData(ctx *gin.Context) {
	var (
		table string = getTable(ctx)
		err   error
		value interface{}
	)
	switch table {
	case "markdown":
		value, err = bindMarkdown(ctx)
	case "bookmark":
		value, err = bindBookmark(ctx)
	case "code":
		value, err = bindCode(ctx)
	}
	if err != nil {
		ginHelper.Failure(ctx, -1, err.Error())
		return
	}
	result := globalDB.Create(value)
	if result.Error != nil {
		ginHelper.Failure(ctx, -1, result.Error.Error())
	} else {
		ginHelper.Success(ctx, value)
	}
}

func bindCode(ctx *gin.Context) (*Code, error) {
	data := &Code{}
	if err := ctx.ShouldBindJSON(data); err != nil {
		return nil, err
	}
	return data, nil
}

func bindMarkdown(ctx *gin.Context) (*Markdown, error) {
	data := &Markdown{}
	if err := ctx.ShouldBindJSON(data); err != nil {
		return nil, err
	}
	return data, nil
}

func bindBookmark(ctx *gin.Context) (*Bookmark, error) {
	data := &Bookmark{}
	if err := ctx.ShouldBindJSON(data); err != nil {
		return nil, err
	}
	return data, nil
}

func modifyData(ctx *gin.Context) {
	if dataID := getDataID(ctx); dataID < 1 {
		ginHelper.Failure(ctx, -1, "data id = 0")
		return
	}
	updateData := ginHelper.AllPostParams(ctx)
	result := globalDB.Table(getTable(ctx)).Where(map[string]interface{}{"id": getDataID(ctx)}).Updates(updateData)
	if result.Error != nil {
		ginHelper.Failure(ctx, -1, result.Error.Error())
	} else {
		ginHelper.Success(ctx, map[string]interface{}{
			"affected": result.RowsAffected,
		})
	}
}

func queryData(ctx *gin.Context) {
	var (
		list []map[string]interface{}
	)
	query := ginHelper.AllGetParams(ctx)

	globalDB.Table(getTable(ctx)).Where(query).Order("id desc").Find(&list)
	ginHelper.Success(ctx, list)
}

func distinctData(ctx *gin.Context) {
	var (
		list []interface{}
	)
	query := ginHelper.AllGetParams(ctx)
	colum := getColum(ctx)

	globalDB.Table(getTable(ctx)).Where(query).Distinct(colum).Find(&list)
	ginHelper.Success(ctx, list)
}

func getCookieDomain(ctx *gin.Context) string {
	if ctx == nil {
		return ""
	}
	host := ctx.Request.Host
	if strings.Contains(host, ":") {
		return strings.Split(host, ":")[0]
	}
	return host
}

type LoginForm struct {
	Token string `json:"token"`
}

// User
type User struct {
	Name     string `json:"name"`
	Nickname string `json:"nickname"`
}

func parseUser(token string) (*User, error) {
	bytes, err := os.ReadFile(filepath.Join(cfg.UserProfileDirectory, token))
	if err != nil {
		return nil, errors.New("user not exist")
	}
	user := &User{}
	err = json.Unmarshal(bytes, &user)
	if err != nil {
		return nil, errors.New("user not ok")
	}
	return user, nil
}

// Login
//
//	@param ctx
func Login(ctx *gin.Context) {
	loginForm := &LoginForm{}
	if err := ctx.ShouldBindJSON(loginForm); err != nil {
		ginHelper.Failure(ctx, -1, err.Error())
		return
	}

	user, err := parseUser(loginForm.Token)

	if err != nil {
		ginHelper.Failure(ctx, -1, err.Error())
		return
	}

	domain := getCookieDomain(ctx)
	ctx.SetCookie(tokenKey, loginForm.Token, 3600*24*365, "/", domain, true, false)
	ginHelper.Success(ctx, user)
}

// CheckLogin
//
//	@param ctx
func checkLogin(ctx *gin.Context) {
	if !strings.HasSuffix(ctx.Request.URL.Path, ".html") || strings.HasSuffix(ctx.Request.URL.Path, "login.html") {
		return
	}

	redirectLogin := func(ctx *gin.Context) {
		ctx.Redirect(http.StatusTemporaryRedirect, "/login.html?jump="+ctx.Request.URL.Path)
		ctx.Abort()
	}

	token, err := ctx.Cookie(tokenKey)
	if err != nil {
		redirectLogin(ctx)
		return
	}
	_, err = parseUser(token)
	if err != nil {
		redirectLogin(ctx)
		return
	}

}

// CheckAPILogin
//
//	@param ctx
func checkAPILogin(ctx *gin.Context) {
	token, err := ctx.Cookie(tokenKey)
	if err != nil {
		ginHelper.Failure(ctx, -100, "user not login")
		return
	}
	loginUser, err := parseUser(token)
	if err != nil {
		ginHelper.Failure(ctx, -100, "user not login")
		return
	}
	ctx.Set("CurrentUser", loginUser)
}

func getUser(ctx *gin.Context) {

	value, exists := ctx.Get("CurrentUser")
	if exists {
		ginHelper.Success(ctx, value)
	}

}
