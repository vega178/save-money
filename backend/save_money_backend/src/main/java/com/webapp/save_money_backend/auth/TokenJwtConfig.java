package com.webapp.save_money_backend.auth;

import io.jsonwebtoken.Jwts;
import javax.crypto.SecretKey;

public class TokenJwtConfig {
    public final static SecretKey SECRET_KEY = Jwts.SIG.HS256.key().build();
    public final static String PREFIX_TOKEN = "Bearer ";
    public final static String HEADER_AUTHORIZATION = "Authorization";
    public final static String CONTENT_TYPE = "application/json";
}
