---- chèn bằng file

-- cách 1: chèm full trường
COPY "User" FROM 'user_data.csv' DELIMITER ',' CSV;

--- cách 2: chèm có chọn field email, password_hash, username
COPY "User" (email, password_hash, username)
FROM '/data/user.csv'
WITH (FORMAT csv, HEADER true, DELIMITER ',');



UPDATE "User"
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$oDdsbvL66JBFGcGtpM2bVQ$BSuYE86W6ALjeRJmC9I5sv/pr6xXJj3eFGvgS+aF7Io'
WHERE email = 'gaconght@gmail.com'
RETURNING *;