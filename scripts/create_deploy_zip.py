import os
import zipfile

def create_deploy_zip():
    zip_path = 'js_deploy_src.zip'
    if os.path.exists(zip_path):
        os.remove(zip_path)

    top_files = [
        'package.json',
        'package-lock.json',
        'server.js',
        'vite.config.js',
        'index.html',
        'cookies.txt'
    ]

    top_dirs = ['dist', 'public', 'src', 'yt_dlp']

    count = 0
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
        # Add root files
        for f in top_files:
            if os.path.exists(f):
                zipf.write(f, arcname=f)
                count += 1
                print(f"Added file: {f}")
            else:
                print(f"Warning: {f} not found!")

        # Add top dirs
        for d in top_dirs:
            if not os.path.exists(d):
                print(f"Warning: directory {d} not found!")
                continue
            for root, dirs, files in os.walk(d):
                # skip __pycache__ or node_modules
                dirs[:] = [sub for sub in dirs if sub not in ('__pycache__', 'node_modules', '.git')]
                for file in files:
                    if file.endswith('.pyc') or file.endswith('.pyo'):
                        continue
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, '.')
                    arcname = rel_path.replace(os.sep, '/')
                    zipf.write(full_path, arcname=arcname)
                    count += 1

    file_size_mb = os.path.getsize(zip_path) / (1024 * 1024)
    print(f"Successfully created {zip_path} with {count} files ({file_size_mb:.2f} MB)")

if __name__ == '__main__':
    create_deploy_zip()
