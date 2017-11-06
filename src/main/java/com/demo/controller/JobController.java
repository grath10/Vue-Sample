package com.demo.controller;

import com.demo.entity.DataTableBean;
import com.demo.entity.JobAndTrigger;
import com.demo.tools.CommonUtils;
import com.github.pagehelper.PageInfo;
import com.demo.entity.JobWithCronTrigger;
import com.demo.service.IJobService;
import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Constructor;

@Controller
@RequestMapping("job")
public class JobController {
    private static Logger logger = LoggerFactory.getLogger(JobController.class);

    @Autowired
    private IJobService iJobService;

    @RequestMapping()
    public String page(){
        return "job";
    }

    @PostMapping("add")
    @ResponseBody
    public void addJob(@RequestParam("jobName") String jobName, @RequestParam("content") String content, @RequestParam("expression") String cronExpression) throws Exception{
        JobAndTrigger jobAndTrigger = new JobAndTrigger();
        jobAndTrigger.setName(jobName);
        jobAndTrigger.setContent(content);
        jobAndTrigger.setSchedule(cronExpression);
        String triggerName = CommonUtils.getUUID();
        jobAndTrigger.setTriggerName(triggerName);
        int result = iJobService.insertJob(jobAndTrigger);
        if(result > 0) {
            addNewJob(triggerName, content, cronExpression);
        }
    }

    private void addNewJob(String jobName, String content, String cronExpression) throws Exception{
        SchedulerFactory sf = new StdSchedulerFactory();
        Scheduler scheduler = sf.getScheduler();
        scheduler.start();
        Class<?> clazz = Class.forName("com.demo.entity.JobWithCronTrigger");
        Constructor constructor = clazz.getConstructor(String.class, String.class);
        JobWithCronTrigger job = (JobWithCronTrigger)constructor.newInstance(cronExpression, content);
        JobDetail jobDetail = JobBuilder.newJob(job.getClass()).withIdentity(jobName).build();
        CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(cronExpression);
        CronTrigger trigger = TriggerBuilder.newTrigger().withIdentity(jobName).withSchedule(scheduleBuilder).build();
        try{
            scheduler.scheduleJob(jobDetail, trigger);
        }catch (SchedulerException e){
            logger.error("创建定时任务失败", e);
        }
    }

    @PostMapping("pause")
    @ResponseBody
    public void pauseJob(@RequestParam("jobName") String jobName) throws Exception{
        SchedulerFactory sf = new StdSchedulerFactory();
        Scheduler scheduler = sf.getScheduler();
        scheduler.pauseJob(JobKey.jobKey(jobName));
    }

    @PostMapping("resume")
    @ResponseBody
    public void resumeJob(@RequestParam("jobName") String jobName) throws Exception{
        SchedulerFactory sf = new StdSchedulerFactory();
        Scheduler scheduler = sf.getScheduler();
        scheduler.resumeJob(JobKey.jobKey(jobName));
    }

    @PostMapping("reschedule")
    @ResponseBody
    public void rescheduleJob(@RequestParam("jobName") String jobName, @RequestParam("cronExpression") String cronExpression) throws Exception{
        try {
            SchedulerFactory schedulerFactory = new StdSchedulerFactory();
            Scheduler scheduler = schedulerFactory.getScheduler();
            TriggerKey triggerKey = TriggerKey.triggerKey(jobName);
            CronScheduleBuilder scheduleBuilder = CronScheduleBuilder.cronSchedule(cronExpression);
            CronTrigger trigger = (CronTrigger)scheduler.getTrigger(triggerKey);
            trigger = trigger.getTriggerBuilder().withIdentity(triggerKey).withSchedule(scheduleBuilder).build();
            scheduler.rescheduleJob(triggerKey, trigger);
        }catch (SchedulerException e){
            logger.error("更新定时任务失败", e);
        }
    }

    @PostMapping("delete")
    @ResponseBody
    public void deleteJob(@RequestParam("jobName") String jobName) throws Exception{
        iJobService.deleteJob(jobName);
        removeJob(jobName);
    }

    private void removeJob(String jobName) throws Exception{
        SchedulerFactory schedulerFactory = new StdSchedulerFactory();
        Scheduler scheduler = schedulerFactory.getScheduler();
        scheduler.pauseTrigger(TriggerKey.triggerKey(jobName));
        scheduler.unscheduleJob(TriggerKey.triggerKey(jobName));
        scheduler.deleteJob(JobKey.jobKey(jobName));
    }

    @GetMapping("query")
    @ResponseBody
    public DataTableBean queryJob(HttpServletRequest request){
        String draw = request.getParameter("draw");
        String dir = request.getParameter("dir");
        String orderColumn = request.getParameter("orderColumn");
        String pageNum = request.getParameter("pageNum");
        String pageSize = request.getParameter("pageSize");
        int numOfPage = Integer.parseInt(pageSize);
        int sizeOfPage = Integer.parseInt(pageNum);
        PageInfo<JobAndTrigger> jobAndTrigger = iJobService.getJobAndTriggerDetails(numOfPage, sizeOfPage, orderColumn, dir);
        DataTableBean dtBean = new DataTableBean();
        dtBean.setTotal((int)jobAndTrigger.getTotal());
        dtBean.setDraw(draw);
        dtBean.setList(jobAndTrigger.getList());
        return dtBean;
    }
}
