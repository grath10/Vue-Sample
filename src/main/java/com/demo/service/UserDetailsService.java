package com.demo.service;

import com.demo.entity.SysUser;
import com.demo.mapper.SysUserMapper;
import com.demo.mapper.UserRoleMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserDetailsService {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private MessageSource messageSource;

    // 根据用户名称从数据库中查找用户
    public boolean loadUserByUsername(String username, String password){
        boolean result = true;
        logger.info("loadUserByUsername --> [{}]", username);
        List<SysUser> userList = sysUserMapper.select(username);
        if(userList == null || userList.size() == 0){
            result = false;
        }else{
            SysUser target = userList.get(0);
            String rightPassword = target.getPassword();
            if(!password.equals(rightPassword)){
                result = false;
            }
        }
        return result;
    }
}
