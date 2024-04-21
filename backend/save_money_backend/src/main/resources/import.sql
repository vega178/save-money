INSERT INTO users (email, password, username) VALUES ('estebanvegapatio@gmail.com', '$2a$10$84M.u0./Kdo.2Eq2idjhCeE21.6bYBdpQ7tRkpMMc2UI8qbMYtVpm', 'vega178');

INSERT INTO roles (name) VALUES ('ROLE_ADMIN');

INSERT INTO roles (name) VALUES ('ROLE_USER');

INSERT INTO users_roles (role_id, id) VALUES (1, 1);

INSERT INTO users_roles (role_id, id) VALUES (2, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Servicios Publicos', 276293, 276293, 0, 5503591, 0, 0, false, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Comida', 800000, 800000, 0, 5503591, 0, 0, false, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Tigo Home', 78802, 78802, 0, 5503591, 0, 0, false, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Tigo Phone', 78802, 78802, 0, 5503591, 0, 0, false , 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Chamo Spotify', 78802, 78802, 0, 5503591, 0, 0, false , 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Funeraria San Vicente', 78802, 78802, 0, 5503591, 0, 0, false , 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Credito avevillas', 1179000, 31000000, 0, 5503591, 0, 0, false, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Couta harold', 1000000, 12000000, 0, 5503591, 0, 0, false, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Intereses Harold', 1000000, 12000000, 0, 5503591, 0, 0, false, 1);

INSERT INTO bills (bill_date, name, amount, total_debt, actual_debt, total_balance, remaining_amount, gap, is_checked, user_id) VALUES ('2024/01/30','Tarjetas de credito', 1000000, 12000000, 0, 5503591, 0, 0, false, 1)