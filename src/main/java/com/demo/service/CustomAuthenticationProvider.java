package com.demo.service;

import com.demo.entity.CustomWebAuthenticationDetails;
import com.demo.entity.MyUserDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.Collection;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {
    protected final Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private MessageSource messageSource;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        CustomWebAuthenticationDetails authDetails = (CustomWebAuthenticationDetails)authentication.getDetails();
        String imageCode = authDetails.getImageCode();
        String session_imageCode = authDetails.getSession_imageCode();
        long session_imageTime = authDetails.getSession_imageTime();
        if(imageCode == null || session_imageCode == null){
//            throw new AuthenticationServiceException("验证码错误");
            throw new AuthenticationServiceException(messageSource.getMessage("wrongVerifyCode",null, null));
        }
        if(!imageCode.equalsIgnoreCase(session_imageCode)){
//            throw new AuthenticationServiceException("验证码错误");
            throw new AuthenticationServiceException(messageSource.getMessage("wrongVerifyCode",null, null));
        }else {
            long now = System.currentTimeMillis();
            if((now - session_imageTime)/1000 > 60){
//                throw new AuthenticationServiceException("验证码已超时");
                throw new AuthenticationServiceException(messageSource.getMessage("timeoutVerifyCode",null, null));
            }
        }
        String userName = authentication.getName();
        String password = (String) authentication.getCredentials();
        MyUserDetails details = (MyUserDetails) userDetailsService.loadUserByUsername(userName);
        logger.info("输入密码/实际密码：" + password + "/" + details.getPassword());
        if (details == null) {
//            throw new BadCredentialsException("用户未找到");
            throw new BadCredentialsException(messageSource.getMessage("userNoutFound",null, null));
        }
        // 密码匹配验证
        if (!password.equals(details.getPassword())) {
//            throw new BadCredentialsException("密码错误");
            throw new BadCredentialsException(messageSource.getMessage("wrongPassword",null, null));
        }
        Collection<? extends GrantedAuthority> authorities = details.getAuthorities();
        return new UsernamePasswordAuthenticationToken(details, password, authorities);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return true;
    }
}
