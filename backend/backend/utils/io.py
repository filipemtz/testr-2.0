
import sys
import yaml
import zipfile
from pathlib import Path
from typing import Union


def unzip(zip_file: str, dest_dir: str):
    """
    based on https://gist.github.com/swaroopjcse/6d789188a9cdb21d725767716669557f
    """
    try:
        zfile = zipfile.ZipFile(zip_file)
        for filename in zfile.namelist():
            zfile.extract(filename, dest_dir)
    except zipfile.BadZipfile:
        print(f"Cannot extract '{zip_file}': Not a valid zipfile.")


def safe_load_yaml(path: Union[Path, str]):
    yaml_data = None

    try:
        if isinstance(path, str):
            f = open(path, "r")
        else:
            f = path.open("r")

        yaml_data = yaml.load(f, Loader=yaml.SafeLoader)
        f.close()
    except FileNotFoundError:
        print(f"File '{path}' not found.")
        if path == 'config.yaml':
            print("This is expected in the first use. Copy config-sample.yaml into config.yaml and edit the required fields.")
        sys.exit(0)

    return yaml_data