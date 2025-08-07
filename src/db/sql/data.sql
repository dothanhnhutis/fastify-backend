---- chèn bằng file
-- cách 1: chèm full trường
COPY users
FROM 'user_data.csv' DELIMITER ',' CSV;
--- cách 2: chèm có chọn field email, password_hash, username
COPY users (email, password_hash, username)
FROM '/data/user.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',');
---
UPDATE users
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$oDdsbvL66JBFGcGtpM2bVQ$BSuYE86W6ALjeRJmC9I5sv/pr6xXJj3eFGvgS+aF7Io',
    username = 'new name'
WHERE email = 'gaconght@gmail.com'
RETURNING *;
---
INSERT INTO Roles (name, permissions)
VALUES (
        'Admin Role',
        ARRAY ['create:role', 'read:role:*', 'delete:role', 'create:warehouse', 'read:warehouse:*', 'delete:warehouse']
    ),
    ('Kho', ARRAY ['read:warehouse:*'])
RETURNING *;
--- Find all Role
SELECT *
FROM roles;
--- Find all User
SELECT *
FROM users;
--- Add Role for User
INSERT INTO user_roles (user_id, role_id)
VALUES (
        '09a2d9aa-2981-4fcf-8084-9704ab5043c4',
        'fdec3bd0-5753-4c16-9917-41fcf182eeb3'
    );
--- Find Roles of User
SELECT *
FROM roles
WHERE id IN (
        SELECT role_id
        FROM user_roles
        WHERE user_id = '09a2d9aa-2981-4fcf-8084-9704ab5043c4'
    );
---
DELETE FROM roles
WHERE id = '50cffaeb-1b75-4834-a18c-189b85f9c276';
---
DROP TABLE IF EXISTS packaging_transactions;
---
DROP TYPE IF EXISTS transaction_type ---
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_id_fkey;
---
DELETE FROM roles
WHERE id not IN (
        '2ec09bf8-e9fb-4e6f-88cc-07ca69602610',
        '30217f60-dd5b-4ad9-a1a8-696fe7fde502'
    );
---
SELECT *
FROM roles
WHERE permissions = ALL('read:warehouse:*') -- WHERE name ILIKE '%Manager update%';
    ---
SELECT *
FROM roles
ORDER BY permissions DESC,
    name ASC
LIMIT 1 OFFSET 1;
---
SELECT *
FROM roles
WHERE permissions @> ARRAY ['read:warehouse:*', 'read:role:*'];
---
SELECT *
FROM roles