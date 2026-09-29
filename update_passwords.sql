USE smart_sms;
UPDATE users SET password_hash = '$2a$10$iZHqqJliFbrUvoUFXXLOoOVNetjG1k8cZ3dU6QBrIWOA6nmLm4EHW' WHERE role = 'ADMIN';
UPDATE users SET password_hash = '$2a$10$k6R/887./HPyLfUCqRdgzePD/astGgUMnOZP89FLBCsA5tim6LbYG' WHERE role = 'FACULTY';
UPDATE users SET password_hash = '$2a$10$XsMZ5uLzOAupxqJjhdvIEOH.QBoXtk0Lb.eYF0B1zqEx4OZRSQ0fe' WHERE role = 'STUDENT';
