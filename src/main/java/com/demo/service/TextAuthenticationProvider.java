package com.demo.service;

import com.demo.entity.MyUserDetails;
import com.demo.entity.TextWebAuthenticationDetails;
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
public class TextAuthenticationProvider implements AuthenticationProvider {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    @Autowired
    private CustomUserDetailsService userDetailsService;
    @Autowired
    private MessageSource messageSource;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String userName = authentication.getName();
        String password = (String) authentication.getCredentials();
        MyUserDetails details = (MyUserDetails) userDetailsService.loadUserByUsername(userName);
        logger.info("输入密码/实际密码：" + password + "/" + details.getPassword());
        // 密码匹配验证
        if (!password.equals(details.getPassword())) {
            throw new BadCredentialsException(messageSource.getMessage("wrongPassword",null, null));
        }
        TextWebAuthenticationDetails authDetails = (TextWebAuthenticationDetails)authentication.getDetails();
        String text = authDetails.getText();
        String comparator = authDetails.getComparator();
        logger.info("页面点击位置坐标:" + text + ", 实际生成位置：" + comparator);
        int result = checkPosition(text, comparator);
        // 验证不成功
        if(result != 1){
            throw new AuthenticationServiceException(messageSource.getMessage("failureAuthentication", null, null));
        }
        Collection<? extends GrantedAuthority> authorities = details.getAuthorities();
        return new UsernamePasswordAuthenticationToken(details, password, authorities);
    }

    private int checkPosition(String text, String comparator){
        int result = 0;
        if(text != null && comparator != null){
            String[] positionArr = text.split(",");
            String[] cmpArr = comparator.split(",");
            for (int i = 0; i < cmpArr.length; i++) {
                if (!isTarget(positionArr[i], cmpArr[i])) {
                    break;
                }
                result = 1;
            }
        }
        return result;
    }

    private boolean isTarget(String cmp, String str){
        String[] source = cmp.split(":");
        String[] target = str.split(":");
        boolean result = true;
        if(!(Integer.parseInt(source[0])-25 < Integer.parseInt(target[0])
                && Integer.parseInt(target[0]) < Integer.parseInt(source[0]) + 35)
                || !(Integer.parseInt(source[1])-15 < Integer.parseInt(target[1])
                && Integer.parseInt(target[1]) < Integer.parseInt(source[1]) + 35)){
            result = false;
        }
        return result;
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return true;
    }
}
