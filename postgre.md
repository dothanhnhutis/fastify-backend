# Postgresql

## Chapter 1. Tutorial

Thứ tự logic phổ biến trong SQL là:

- FROM
- JOIN (nếu có)
- WHERE
- GROUP BY
- HAVING
- SELECT
- ORDER BY
- LIMIT / OFFSET

## Chapter 2. The SQL Language

### 2.3 Creating a new table

```sql
--- Tạo bảng mới
CREATE TABLE weather (
    city            varchar(80),
    temp_lo         int,           -- low temperature
    temp_hi         int,           -- high temperature
    prcp            real,          -- precipitation
    date            date
);

CREATE TABLE cities (
    name            varchar(80),
    location        point
);

--- Xoá bảng
DROP TABLE tablename;
```

### 2.4 Populating a Table With Rows

```sql
--- thêm dữ liệu vào bảng
--- cách 1
INSERT INTO weather VALUES ('San Francisco', 46, 50, 0.25, '1994-11-27');
--- cách 2
INSERT INTO weather (city, temp_lo, temp_hi, prcp, date)
    VALUES ('San Francisco', 43, 57, 0.0, '1994-11-29');
--- cách 3
COPY weather FROM '/home/user/weather.txt';
--- cách 4
COPY weather FROM '/home/user/weather_csv.txt' DELIMITER ',' CSV;
```

Nội dung file `weather.txt` nếu dùng mặc định (phân cách bằng tab `\t`)

```yaml
San Francisco	46	50	0.25	2025-07-21
New York	38	47	0.15	2025-07-22
Chicago	30	36	0.00	2025-07-23
```

Nội dung file `weather_csv.txt` nếu dùng dấu phẩy `,`

```yaml
San Francisco,46,50,0.25,2025-07-21
New York,38,47,0.15,2025-07-22
Chicago,30,36,0.00,2025-07-23
```

### 2.5. Querying a Table

```sql
--- Lấy tất cả dữ liệu từ bảng weather
SELECT * FROM weather;
--- hoặc
SELECT city, temp_lo, temp_hi, prcp, date FROM weather;
--- lấy city, tính trung bình nhệt độ và rán tên 'temp_avg' và date từ bảng 'weather'
SELECT city, (temp_hi+temp_lo)/2 AS temp_avg, date FROM weather;
--- lấy tất cả các dòng thoả điều kiện
SELECT * FROM weather WHERE city = 'San Francisco' AND prcp > 0.0;
--- sắp xếp theo 'city' và lấy tất cả dữ liệu
SELECT * FROM weather ORDER BY city;
--- sắp xếp theo 'city' và 'temp_lo' và lấy tất cả dữ liệu
SELECT * FROM weather ORDER BY city, temp_lo;
--- chọn cột 'city' và loại bỏ các dữ liệu trùng ở cột 'city;
SELECT DISTINCT city FROM weather;
```

### 2.6. Joins Between Tables

```sql
--- ghép 2 bảng 'weather' và 'cities' ở 'city' của bảng 'weather' với 'name' của bảng 'cities'
SELECT * FROM weather JOIN cities ON city = name;
---hoặc
SELECT weather.city, weather.temp_lo, weather.temp_hi,
       weather.prcp, weather.date, cities.location
    FROM weather JOIN cities ON weather.city = cities.name;
--- Đặt tên cho bảng khi join
SELECT * FROM weather w JOIN cities c ON w.city = c.name;
--- Giữ bên trái của join 'weather'
SELECT * FROM weather LEFT OUTER JOIN cities ON weather.city = cities.name;

--- SELF JOIN: giả sử chúng ta muốn tìm tất cả các bản ghi thời tiết nằm trong phạm vi nhiệt độ của các bản ghi thời tiết khác. Vì vậy, chúng ta cần so sánh các cột temp_lo và temp_hi của mỗi hàng thời tiết với các cột temp_lo và temp_hi của tất cả các hàng thời tiết khác
SELECT w1.city, w1.temp_lo AS low, w1.temp_hi AS high,
       w2.city, w2.temp_lo AS low, w2.temp_hi AS high
    FROM weather w1 JOIN weather w2
        ON w1.temp_lo < w2.temp_lo AND w1.temp_hi > w2.temp_hi;
```

Các loại kết hợp bảng
| Loại JOIN | Bên trái có | Bên phải có | Ghi chú |
| ------------ | ----------- | ----------- | ----------------------------------- |
| INNER JOIN hoặc JOIN | ✅ có | ✅ có | Chỉ lấy bản ghi khớp |
| LEFT JOIN hoặc LEFT OUTER JOIN | ✅ có | ⚠️ nếu có | Luôn giữ bên trái |
| RIGHT JOIN hoặc RIGHT OUTER JOIN | ⚠️ nếu có | ✅ có | Luôn giữ bên phải |
| FULL JOIN hoặc FULL OUTER JOIN | ✅ có/ko | ✅ có/ko | Kết hợp cả hai, không khớp thì NULL |
| CROSS JOIN | ✅ | ✅ | Nhân chéo mọi dòng |
| SELF JOIN | ✅ | ✅ | JOIN bảng với chính nó |
| NATURAL JOIN | ✅ | ✅ | JOIN theo cột cùng tên |

### 2.7. Aggregate Functions

Các hàm tổng hợp mà Postgresql hỗ trợ: count, sum, avg (average), max (maximum) and min (minimum)

Thông thường sử dụng hàm tổng hợp kết hợp với `GROUP BY` `HAVING` và sử dụng `FILTER` để lọc riêng cho hàm tổng hợp

```sql
--- tìm nhiệt độ cao nhất của cột 'temp_lo'
SELECT max(temp_lo)
    FROM weather;
--- để biêt nhiệu độ cao nhất của cột 'temp_lo' thuộc về thành phố nào
SELECT city
    FROM weather
    WHERE temp_lo = (SELECT max(temp_lo) FROM weather);
--- nhóm bảng 'weather' theo 'city' sau đó lấy city, đếm số dòng, và tìm max của 'temp_lo'
SELECT city, count(*), max(temp_lo)
    FROM weather
    GROUP BY city;
--- sử dụng HAVING để lọc nhóm sau khi GROUP BY
SELECT city, count(*), max(temp_lo)
    FROM weather
    GROUP BY city
    HAVING max(temp_lo) < 40;
---
SELECT city, count(*), max(temp_lo)
    FROM weather
    WHERE city LIKE 'S%'
    GROUP BY city;
--- Dùng FILTER để lọc riêng cho hàm tổng hợp (aggregate)
SELECT city, count(*) FILTER (WHERE temp_lo < 45), max(temp_lo)
    FROM weather
    GROUP BY city;
```

### 2.8. Updates

```sql
UPDATE weather
    SET temp_hi = temp_hi - 2,  temp_lo = temp_lo - 2
    WHERE date > '1994-11-28';
```

### 2.9. Deletions

```sql
DELETE FROM weather WHERE city = 'Hayward';
--- xoá tất cả các dòng của bảng
DELETE FROM tablename;
```

## Chapter 3. Advanced Features

### 3.2. Views

```sql
CREATE VIEW myview AS
    SELECT name, temp_lo, temp_hi, prcp, date, location
        FROM weather, cities
        WHERE city = name;

SELECT * FROM myview;
```

### 3.3. Foreign Keys

all-or-nothing operation

```sql
CREATE TABLE cities (
        name     varchar(80) primary key, --- primary key
        location point
);

CREATE TABLE weather (
        city      varchar(80) references cities(name), --- Foreign Keys
        temp_lo   int,
        temp_hi   int,
        prcp      real,
        date      date
);
```

### 3.4. Transactions

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100.00
    WHERE name = 'Alice';
-- etc etc
COMMIT;
```

### 3.5. Window Functions

Window Functions của PostgreSQL có tác dụng chia dữ liệu thành từng nhóm (partition) để hàm cửa sổ (window function) tính toán trong phạm vi từng nhóm đó, mà không gộp nhóm như `GROUP BY`.

Các window function phổ biến dùng với `PARTITION BY`

- ROW_NUMBER(): Đánh số thứ tự trong mỗi nhóm
- RANK(), DENSE_RANK(): Xếp hạng trong nhóm
- SUM(), AVG(), MIN(), MAX(): Tính tổng, trung bình... theo nhóm
- LAG(), LEAD(): Lấy giá trị dòng trước/sau trong nhóm

Khác biệt với GROUP BY:

- GROUP BY: Gộp nhóm → 1 dòng cho mỗi nhóm.
- PARTITION BY: Không gộp nhóm, dữ liệu chi tiết vẫn còn, chỉ tính toán trong phạm vi từng nhóm.

Ví dụ: Giả sử có bảng weather
| city | date | temp_lo |
| ----- | ---------- | -------- |
| Hanoi | 2025-07-21 | 28 |
| Hanoi | 2025-07-22 | 30 |
| HCM | 2025-07-21 | 32 |
| HCM | 2025-07-22 | 31 |
| HCM | 2025-07-23 | 33 |

```sql
--- Dùng GROUP BY (gộp nhóm)
SELECT city, AVG(temp_lo)
FROM weather
GROUP BY city;
```

Kết quả

| city  | avg_temp_lo |
| ----- | ----------- |
| Hanoi | 29          |
| HCM   | 32          |

```sql
--- Dùng Window Function với PARTITION BY
SELECT city, date, temp_lo,
       AVG(temp_lo) OVER (PARTITION BY city) AS avg_temp_city
FROM weather;
```

| city  | date       | temp_lo | avg_temp_city |
| ----- | ---------- | ------- | ------------- |
| Hanoi | 2025-07-21 | 28      | 29            |
| Hanoi | 2025-07-22 | 30      | 29            |
| HCM   | 2025-07-21 | 32      | 32            |
| HCM   | 2025-07-22 | 31      | 32            |
| HCM   | 2025-07-23 | 33      | 32            |
