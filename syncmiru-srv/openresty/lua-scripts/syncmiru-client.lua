local jwt = require "resty.jwt"

local file_acc_key_file = io.open("/etc/openresty/keys/file_acc_pub.pem", "r")
local file_acc_key = file_acc_key_file:read("*all")
file_acc_key_file:close()

local spec = {
   exp = function(v) return ngx.time() < v end
}

local function exit_forbidden()
    ngx.status = ngx.HTTP_FORBIDDEN
    ngx.exit(ngx.status)
end

local function exit_bad_request()
    ngx.status = ngx.HTTP_BAD_REQUEST
    ngx.exit(ngx.HTTP_BAD_REQUEST)
end

local internal_prefix = "/noauth"

local headers = ngx.req.get_headers()
if not headers["Authorization"] then
    ngx.say("Missing HTTP Authorization header")
    exit_bad_request()
end

local auth_header = headers["Authorization"]
local _, j = string.find(auth_header, "Bearer ")
if not j then
    ngx.say("Error parsing JWT token from Bearer")
    exit_bad_request()
end

local token_start = j + 1
local raw_jwt = string.sub(auth_header, token_start, string.len(auth_header))
if not raw_jwt then
    ngx.say("Error decoding JWT token")
    exit_bad_request()
end

local jwt_obj = jwt:load_jwt(raw_jwt)
local jwt_checked = jwt:verify_jwt_obj(file_acc_key, jwt_obj, spec)
if not jwt_checked.valid or not jwt_checked.verified then
    ngx.say("JWT tampered")
    exit_forbidden()
end

local file = internal_prefix .. jwt_checked.payload.file
ngx.exec(file)

