local assdraw = require 'mp.assdraw'
local utils = require 'mp.utils'

local MOOD_NEUTRAL = 0
local MOOD_BAD = 1
local MOOD_GOOD = 2
local MOOD_WARNING = 3

local COLOR_WARNING = "00FFFF"
local COLOR_NEUTRAL = "FFFF00"
local COLOR_BAD = "0000FF"
local COLOR_GOOD = "00FF00"

local FONT_SIZE = 28
local NEXT_ID = 1

local function fetch_msg_id()
    local id = NEXT_ID
    NEXT_ID = NEXT_ID + 1
    return id
end

local order = {}
local msgs = {}
Message = { text = "", timestamp = nil, duration = nil, mood = MOOD_NEUTRAL }

function Message:new(o)
    o = o or {}
    setmetatable(o, self)
    self.__index = self
    return o
end

local function ass_newline()
    return "\\N"
end

local function ass_font_size()
    return "{\\fs" .. FONT_SIZE .. "}"
end


local function ass_color(mood)
    local color
    if mood == MOOD_NEUTRAL then
        color = "{\\1c&H" .. COLOR_NEUTRAL .. "}"
    elseif mood == MOOD_BAD then
        color = "{\\1c&H" .. COLOR_BAD .. "}"
    elseif mood == MOOD_GOOD then
        color = "{\\1c&H" .. COLOR_GOOD .. "}"
    elseif mood == MOOD_WARNING then
        color = "{\\1c&H" .. COLOR_WARNING .. "}"
    end
    return color
end

local function render_msgs()
    local msgs_good = {}
    local msgs_bad = {}
    local msgs_neutral = {}
    local msgs_warning = {}
    for _, id in ipairs(order) do
        if msgs[id] ~= nil then
            if msgs[id].mood == MOOD_GOOD then
                table.insert(msgs_good, msgs[id])
            elseif msgs[id].mood == MOOD_BAD then
                table.insert(msgs_bad, msgs[id])
            elseif msgs[id].mood == MOOD_NEUTRAL then
                table.insert(msgs_neutral, msgs[id])
            elseif msgs[id].mood == MOOD_WARNING then
                table.insert(msgs_warning, msgs[id])
            end
        end
    end

    local msgs_array = {}
    for _, v in ipairs(msgs_bad) do
        table.insert(msgs_array, v)
    end

    for _, v in ipairs(msgs_warning) do
        table.insert(msgs_array, v)
    end

    for _, v in ipairs(msgs_good) do
        table.insert(msgs_array, v)
    end
    
    for _, v in ipairs(msgs_neutral) do
        table.insert(msgs_array, v)
    end

    local osd_w, osd_h, osd_aspect = mp.get_osd_size()
    local ass = assdraw.ass_new()
    local w = math.ceil(osd_w * 0.01)
    local h = math.ceil(osd_h * 0.01)
    ass:pos(w,h)

    local render = ass_font_size()
    for _, msg in ipairs(msgs_array) do
        render = render .. ass_color(msg.mood) .. msg.text .. ass_newline()
    end
    ass:append(render)
    mp.set_osd_ass(osd_w, osd_h, ass.text)
end


mp.register_script_message('msg-add', function(text, duration_str, mood_str) 
    local time = mp.get_time()
    local duration = tonumber(duration_str)
    local mood = tonumber(mood_str)
    local id = fetch_msg_id()

    local msg = Message:new{text = text, time = time, duration = duration, mood = mood}
    msgs[id] = msg
    table.insert(order, id)

    if duration > 0 then
        mp.add_timeout(duration, function()
            table.remove(order, id)
            msgs[id] = nil
            render_msgs()
        end)
    end
    render_msgs()
    mp.command_native_async({"script-message", "msg-id", utils.to_string(id)}, function(success, result, error_msg) end)
end)

mp.register_script_message('msg-del', function(id_str) 
    local id = tonumber(id_str)
    table.remove(order, id)
    msgs[id] = nil
    render_msgs()
end)

local function on_window_size_change(name, dimensions)
    render_msgs()
end
mp.observe_property("osd-dimensions", "native", on_window_size_change)

function handle_mouse_btn2()
    mp.command("cycle pause")
    handle_mouse_button()
end

function handle_mouse_button()
    mp.command_native_async({"script-message", "mouse-btn-click"}, function(success, result, error_msg) end)
end

function handle_mouse_enter()
    mp.command_native_async({"script-message", "mouse-enter"}, function(success, result, error_msg) end)
end

function handle_left_mouse_button_dbl_click()
    mp.command_native_async({"script-message", "mouse-left-dbl-click"}, function(success, result, error_msg) end)
end

mp.add_key_binding("MOUSE_BTN0", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN1", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN2", handle_mouse_btn2)

-- -- wheel up, wheel down ignored

mp.add_key_binding("MOUSE_BTN5", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN6", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN7", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN8", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN9", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN10", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN11", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN12", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN13", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN14", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN15", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN16", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN17", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN18", handle_mouse_button)
mp.add_key_binding("MOUSE_BTN19", handle_mouse_button)

mp.add_key_binding("mouse_enter", handle_mouse_enter)
mp.add_key_binding('MBTN_LEFT_DBL', handle_left_mouse_button_dbl_click)