package com.example.counselingappjava.config.jackson;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;

/**
 * 支持将布尔值/数字/字符串反序列化为 Integer(0/1)
 */
public class BooleanToIntegerDeserializer extends JsonDeserializer<Integer> {

    @Override
    public Integer deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonToken token = p.currentToken();
        if (token == JsonToken.VALUE_TRUE) {
            return 1;
        }
        if (token == JsonToken.VALUE_FALSE) {
            return 0;
        }
        if (token == JsonToken.VALUE_NUMBER_INT) {
            return p.getIntValue();
        }
        if (token == JsonToken.VALUE_STRING) {
            String value = p.getText();
            if (value == null || value.trim().isEmpty()) {
                return null;
            }
            String normalized = value.trim();
            if ("true".equalsIgnoreCase(normalized)) {
                return 1;
            }
            if ("false".equalsIgnoreCase(normalized)) {
                return 0;
            }
            try {
                return Integer.parseInt(normalized);
            } catch (NumberFormatException ex) {
                throw ctxt.weirdStringException(normalized, Integer.class, "isRecurring 仅支持 true/false 或数字");
            }
        }
        if (token == JsonToken.VALUE_NULL) {
            return null;
        }
        return (Integer) ctxt.handleUnexpectedToken(Integer.class, p);
    }
}