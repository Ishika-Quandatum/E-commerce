import os

directories = [
    r'c:\E-commerce\frontend\src\pages\superadmin',
    r'c:\E-commerce\frontend\src\components\superadmin'
]

for directory in directories:
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.jsx') or file.endswith('.js'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace('font-bold', 'font-normal').replace('font-black', 'font-medium')
                
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {path}")
print("Done removing bold fonts from Admin Panel.")
