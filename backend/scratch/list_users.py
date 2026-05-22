from django.contrib.auth import get_user_model
User = get_user_model()
users = User.objects.all()
for u in users:
    print(f"Username: {u.username}, Email: {u.email}, Role: {u.role}, IsActive: {u.is_active}, IsStaff: {u.is_staff}, IsSuperUser: {u.is_superuser}")
