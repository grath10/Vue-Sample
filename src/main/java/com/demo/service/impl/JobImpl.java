package com.demo.service.impl;

import com.demo.entity.JobAndTrigger;
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.demo.mapper.JobMapper;
import com.demo.service.IJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JobImpl implements IJobService{
    @Autowired
    private JobMapper jobMapper;

    @Override
    public PageInfo<JobAndTrigger> getJobAndTriggerDetails(int pageNum, int pageSize, String orderColumn, String dir) {
        PageHelper.startPage(pageSize, pageNum);
        Map<String, String> map = new HashMap<>();
        map.put("orderColumn", orderColumn);
        map.put("dir", dir);
        List<JobAndTrigger> list = jobMapper.getJobDetails(map);
        PageInfo<JobAndTrigger> page = new PageInfo<>(list);
        return page;
    }

    @Override
    public int insertJob(JobAndTrigger jobAndTrigger) {
        String name = jobAndTrigger.getName();
        int count = jobMapper.getExistence(name);
        if(count > 0){
            return -1;
        }else {
            return jobMapper.insertJob(jobAndTrigger);
        }
    }

    @Override
    public int deleteJob(String jobName) {
        return jobMapper.deleteJob(jobName);
    }
}
