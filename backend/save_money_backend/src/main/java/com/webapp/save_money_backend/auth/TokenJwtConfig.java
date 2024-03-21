package com.webapp.save_money_backend.auth;

public class TokenJwtConfig {

    public final static String SECRET_KEY = "esto_va_ser_el_token_que_vamos";
    public final static String PREFIX_TOKEN = "Bearer ";
    public final static String HEADER_AUTHORIZATION = "Authorization";
    public final static String CONTENT_TYPE = "application/json";
}
