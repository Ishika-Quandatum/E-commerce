import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()

from apps.products.models import Product
from apps.vendors.models import Vendor

def delete_product():
    try:
        # Based on the screenshot: Product Name "Test", Vendor "Official Store"
        products = Product.objects.filter(name="Test", vendor__shop_name="Official Store")
        
        count = products.count()
        if count == 0:
            print("No matching product found.")
            # Let's try searching by just name if vendor match fails
            products = Product.objects.filter(name="Test")
            count = products.count()
            if count == 0:
                print("No product named 'Test' found at all.")
                return

        print(f"Found {count} product(s) matching criteria. Deleting...")
        for p in products:
            print(f"Deleting product ID: {p.id}, Name: {p.name}, Vendor: {p.vendor.shop_name if p.vendor else 'None'}")
            p.delete()
        print("Deletion successful.")
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    delete_product()
