package com.demo.mapper;

import com.demo.entity.JobAndTrigger;

import java.util.List;
import java.util.Map;

public interface JobMapper {
    List<JobAndTrigger> getJobDetails(Map<String, String> map);

    int insertJob(JobAndTrigger job);

    int getExistence(String name);

    int deleteJob(String name);
}
