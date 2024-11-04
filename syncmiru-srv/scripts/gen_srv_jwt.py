#!/usr/bin/env python3
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from pathlib import Path
from datetime import datetime
from datetime import timezone
import time
import sys
import os
import jwt


def main():
    if len(sys.argv) == 1:
        print('Error: missing positional argument', file=sys.stderr)
        print_usage()
        exit(1)
    if len(sys.argv) > 2:
        print('Error: too many arguments given', file=sys.stderr)
        print_usage()
        exit(1)
    private_key_file_path_str = sys.argv[1]
    private_key_file_path = Path(private_key_file_path_str)
    if not private_key_file_path.exists():
        print(f'Error: {private_key_file_path} does not exist', file=sys.stderr)
        print_usage()
        exit(1)

    alg, key = read_pem(private_key_file_path)
    jwt = gen_json_list_jwt(alg, key)
    print(f'algorithm: {alg}')
    print(f'srv_jwt: {jwt}')


def read_pem(path):
    try:
        with open(path, 'rb') as file:
            key_data = file.read()
    except:
        print(f'Error: reading {path} failed')
        print_usage()
        exit(1)

    # Load the key
    try:
        key = serialization.load_pem_private_key(key_data, password=None, backend=default_backend())
    except:
        print(f'Error: deserializing key data failed. Does the file given contain a private key?', file=sys.stderr)
        print_usage()
        exit(1)

    # Check the type of key and return the type and curve if applicable
    if isinstance(key, rsa.RSAPrivateKey):
        return "RS512", key
    elif isinstance(key, ec.EllipticCurvePrivateKey):
        curve_name = key.curve.name
        if curve_name == "secp256r1":
            return "ES256", key
        elif curve_name == "secp521r1":
            return "ES512", key
        else:
            print(f'Error: EC with unknown curve {curve_name}')
            print_usage()
            exit(1)

    else:
        print(f'Error: Unknown key type')
        print_usage()
        exit(1)


def gen_json_list_jwt(alg, key):
    issued_time = datetime.now(tz=timezone.utc)
    unix_time = int(time.mktime(issued_time.timetuple()))

    payload = {
        'issued': unix_time
    }

    return jwt.encode(payload, key, alg)


def print_usage():
    file_name = os.path.basename(__file__)
    print(f'usage: {file_name} [private_key_file]\n'
          f'\n'
          f'generates a srv_jwt\n'
          f'\n'
          f'positional arguments:\n'
          f'  private_key_file      file path to a private key')


if __name__ == '__main__':
    main()
