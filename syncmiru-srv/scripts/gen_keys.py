#!/usr/bin/env python3
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization
from datetime import datetime
from datetime import timezone
from pathlib import Path
from ruamel.yaml import YAML
import time
import jwt
import sys

yaml = YAML()
yaml.preserve_quotes = True


def main():
    login_jwt_priv, login_jwt_pub = create_secp521r1_pair()
    file_acc_priv, file_acc_pub = create_secp521r1_pair()
    json_list_priv, json_list_pub = create_secp521r1_pair()

    srv_jwt = gen_json_list_jwt(json_list_priv)

    syncmiru_srv_path = Path(__file__).resolve().parent.parent
    config_yaml_path = syncmiru_srv_path.joinpath('config.yaml')
    if not config_yaml_path.exists():
        print(f'Error: {config_yaml_path} does not exists', file=sys.stderr)
        exit(1)
    try:
        with open(config_yaml_path, 'r') as file:
            config_yaml = yaml.load(file)
    except:
        print(f'Error: {config_yaml_path} cannot be read', file=sys.stderr)
        exit(1)

    config_yaml['login_jwt'] = {
        'priv_key_file': './keys/login_jwt_priv.pem',
        'pub_key_file': './keys/login_jwt_pub.pem',
        'algorithm': 'ES512'
    }

    if 'sources' not in config_yaml:
        print(f'Error: {config_yaml_path} does not contain sources: section', file=sys.stderr)
        exit(1)
    if len(config_yaml['sources']) == 0:
        print(f'Error: {config_yaml_path} does not contain any source. This script can be used with precisely one configured source', file=sys.stderr)
        exit(1)
    if len(config_yaml['sources']) > 1:
        print(f'Error: {config_yaml_path} contains more than one source. This script can be used with precisely one configured source', file=sys.stderr)
        exit(1)

    source_key = next(iter(config_yaml['sources'].keys()))
    source = config_yaml['sources'][source_key]
    source['srv_jwt'] = srv_jwt
    source['priv_key_file'] = './keys/file_acc_priv.pem'
    source['algorithm'] = 'ES512'
    try:
        with open(config_yaml_path, 'w') as file:
            yaml.dump(config_yaml, file)
    except:
        print(f'Error: {config_yaml_path} cannot be written', file=sys.stderr)
        exit(1)
    print(f'Successfully modified {config_yaml_path}')

    syncmiru_srv_keys_path = syncmiru_srv_path.joinpath('keys')
    openresty_keys_path = syncmiru_srv_path.joinpath('openresty').joinpath('keys')

    write_key_to_file(private2pem(login_jwt_priv), syncmiru_srv_keys_path.joinpath('login_jwt_priv.pem'))
    write_key_to_file(public2pem(login_jwt_pub), syncmiru_srv_keys_path.joinpath('login_jwt_pub.pem'))

    write_key_to_file(public2pem(json_list_pub), openresty_keys_path.joinpath('json_list_pub.pem'))

    write_key_to_file(private2pem(file_acc_priv), syncmiru_srv_keys_path.joinpath('file_acc_priv.pem'))
    write_key_to_file(public2pem(file_acc_pub), openresty_keys_path.joinpath('file_acc_pub.pem'))

    print('OK')


def gen_json_list_jwt(json_list_priv):
    issued_time = datetime.now(tz=timezone.utc)
    unix_time = int(time.mktime(issued_time.timetuple()))

    payload = {
        'issued': unix_time
    }

    return jwt.encode(payload, json_list_priv, 'ES512')


def create_secp521r1_pair():
    private_key = ec.generate_private_key(ec.SECP521R1(), default_backend())
    public_key = private_key.public_key()
    return private_key, public_key


def write_key_to_file(pem, filepath):
    try:
        with open(filepath, 'wb') as file:
            file.write(pem)
    except:
        print(f'Error: Writing to file {filepath} failed')
        exit(1)

    print(f'Successfully written {filepath}')


def private2pem(key):
    return key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )


def public2pem(key):
    return key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )


if __name__ == '__main__':
    main()
