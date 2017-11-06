package com.demo.service;

import com.demo.entity.JobAndTrigger;
import com.github.pagehelper.PageInfo;

public interface IJobService {
    PageInfo<JobAndTrigger> getJobAndTriggerDetails(int pageNum, int pageSize, String orderColumn, String dir);

    int insertJob(JobAndTrigger jobAndTrigger);

    int deleteJob(String jobName);
}
