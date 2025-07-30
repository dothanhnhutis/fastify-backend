-- COPY "User" FROM 'user_data.csv' DELIMITER ',' CSV;

--- cách 2
COPY "User" (email, password_hash, username)
FROM '/data/user.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',');