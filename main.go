package main

import (
	"errors"
	"fmt"
	"net/http"
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

type AppConfig struct {
	Port     int64    `env:"PORT"`
	Database string   `env:"DATABASE"`
	Category []string `env:"CATEGORY" envSeparator:","`
}

var (
	globalDB *gorm.DB
)

func main() {
	cfg := &AppConfig{}
	if err := env.Parse(cfg); err != nil {
		panic(err)
	}
	if db, err := open(cfg.Database); err != nil {
		panic(err)
	} else {
		globalDB = db
	}
	router := gin.New()
	router.RedirectFixedPath = false
	router.RedirectTrailingSlash = false
	router.POST("/delete/markdown/:id", ginHelper.DoResponseJSON(), deleteData)
	router.POST("/create/markdown", ginHelper.DoResponseJSON(), createData)
	router.POST("/modify/markdown/:id", ginHelper.DoResponseJSON(), modifyData)
	router.GET("/query/markdown", ginHelper.DoResponseJSON(), queryData)
	router.GET("/category", ginHelper.DoResponseJSON(), func(ctx *gin.Context) {
		ginHelper.Success(ctx, cfg.Category)
	})
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

func deleteData(ctx *gin.Context) {
	if dataID := getDataID(ctx); dataID < 1 {
		ginHelper.Failure(ctx, -1, "data id = 0")
		return
	}
	result := globalDB.Exec(fmt.Sprintf("DELETE FROM markdown where id = %d", getDataID(ctx)))
	if result.Error != nil {
		ginHelper.Failure(ctx, -1, result.Error.Error())
	} else {
		ginHelper.Success(ctx, map[string]interface{}{
			"affected": result.RowsAffected,
		})
	}
}

func createData(ctx *gin.Context) {
	data := &Markdown{}
	if err := ctx.ShouldBindJSON(data); err != nil {
		ginHelper.Failure(ctx, -1, err.Error())
		return
	}
	result := globalDB.Create(data)
	if result.Error != nil {
		ginHelper.Failure(ctx, -1, result.Error.Error())
	} else {
		ginHelper.Success(ctx, data)
	}
}

func modifyData(ctx *gin.Context) {
	if dataID := getDataID(ctx); dataID < 1 {
		ginHelper.Failure(ctx, -1, "data id = 0")
		return
	}
	updateData := ginHelper.AllPostParams(ctx)
	result := globalDB.Model(&Markdown{}).Where(map[string]interface{}{"id": getDataID(ctx)}).Updates(updateData)
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

	globalDB.Model(&Markdown{}).Where(query).Order("id desc").Find(&list)
	ginHelper.Success(ctx, list)
}
