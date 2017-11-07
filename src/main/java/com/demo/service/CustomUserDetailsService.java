package com.demo.service;

import com.demo.entity.MyUserDetails;
import com.demo.entity.SysUser;
import com.demo.entity.UserRole;
import com.demo.mapper.SysUserMapper;
import com.demo.mapper.UserRoleMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomUserDetailsService implements UserDetailsService {
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private SysUserMapper sysUserMapper;

    @Autowired
    private UserRoleMapper userRoleMapper;

    @Autowired
    private MessageSource messageSource;

    // 依据用户名称从数据库中查找用户
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("loadUserByUsername --> [{}]", username);
        List<SysUser> userList = sysUserMapper.select(username);
        if(userList == null || userList.size() == 0){
            throw new UsernameNotFoundException(messageSource.getMessage("userNotFound",null, null));
        }else {
            SysUser user = userList.get(0);
            List<UserRole> roles = userRoleMapper.getRolesByUser(user);
            return new MyUserDetails(user, roles);
        }
    }
}
