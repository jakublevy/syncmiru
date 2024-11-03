local jwt = require "resty.jwt"

local json_list_key_file = io.open("/etc/openresty/keys/json_list_pub.pem", "r")
local json_list_key = json_list_key_file:read("*all")
json_list_key_file:close()

local spec = {
   issued = function(v) return v < ngx.time() end
}

local function exit_forbidden()
    ngx.status = ngx.HTTP_FORBIDDEN
    ngx.exit(ngx.status)
end

local function exit_bad_request()
    ngx.status = ngx.HTTP_BAD_REQUEST
    ngx.exit(ngx.HTTP_BAD_REQUEST)
end

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
local jwt_checked = jwt:verify_jwt_obj(json_list_key, jwt_obj, spec)
if not jwt_checked.valid or not jwt_checked.verified then
    ngx.say("JWT tampered")
    exit_forbidden()
end

local args = ngx.req.get_uri_args()
local dir = args["dir"]
if not dir then
    ngx.say("Missing 'dir' parameter")
    exit_bad_request()
end

if dir:len() < 1 or dir:sub(1,1) ~= "/" then
   ngx.say("Invalid 'dir' parameter")
   exit_bad_request()
end


local root = "/json-list"
local fullpath = root .. dir

if fullpath:sub(-1,-1) ~= "/" then
   fullpath = fullpath .. "/"
end

ngx.exec(fullpath)

