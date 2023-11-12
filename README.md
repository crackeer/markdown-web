
# 介绍


# SQL

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