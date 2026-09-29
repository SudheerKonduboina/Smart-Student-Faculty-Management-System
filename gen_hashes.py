import bcrypt

salt_admin = bcrypt.gensalt(rounds=10, prefix=b'2a')
hash_admin = bcrypt.hashpw(b'Admin@123', salt_admin).decode()

salt_fac = bcrypt.gensalt(rounds=10, prefix=b'2a')
hash_fac = bcrypt.hashpw(b'Faculty@123', salt_fac).decode()

salt_stud = bcrypt.gensalt(rounds=10, prefix=b'2a')
hash_stud = bcrypt.hashpw(b'Student@123', salt_stud).decode()

with open('update_passwords.sql', 'w') as f:
    f.write('USE smart_sms;\n')
    f.write(f"UPDATE users SET password_hash = '{hash_admin}' WHERE role = 'ADMIN';\n")
    f.write(f"UPDATE users SET password_hash = '{hash_fac}' WHERE role = 'FACULTY';\n")
    f.write(f"UPDATE users SET password_hash = '{hash_stud}' WHERE role = 'STUDENT';\n")

print("Generated update_passwords.sql successfully")
