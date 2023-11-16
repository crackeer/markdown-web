# 介绍
* markdown编辑器
* 书签管理
* 代码管理
# SQL
* markdown

```sql
CREATE TABLE markdown(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   title           TEXT    NOT NULL,
   content        TEXT    NOT NULL,
   category           TEXT     NOT NULL,
   create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   modify_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

* bookmark

```sql
CREATE TABLE bookmark(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   title           TEXT    NOT NULL,
   link        TEXT    NOT NULL,
   category           TEXT     NOT NULL,
   create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   modify_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

* category

```sql
CREATE TABLE category(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   name           TEXT    NOT NULL,
   belong       TEXT     NOT NULL,
   create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   modify_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

* code

```sql
CREATE TABLE code(
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   title        TEXT    NOT NULL,
   language     TEXT    NOT NULL,
   content       TEXT     NOT NULL,
   create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   modify_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
