package com.demo.entity;

import org.quartz.CronTrigger;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.SimpleDateFormat;
import java.util.Date;

public class JobWithCronTrigger implements Job{
    private final static Logger logger = LoggerFactory.getLogger(JobWithCronTrigger.class);

    private static SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private String cronExpression;
    private String content;

    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public JobWithCronTrigger(){

    }

    public JobWithCronTrigger(String cronExpression, String content){
        this.cronExpression = cronExpression;
        this.content = content;
    }

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        CronTrigger trigger = (CronTrigger)context.getTrigger();
        String cron = trigger.getCronExpression();
        Date previous = context.getPreviousFireTime();
        Date next = context.getNextFireTime();
        logger.info("lastTime: " + formatDate(previous));
        logger.info("nextTime: " + formatDate(next));
        logger.info("Running JobWithCronTrigger " + cron);
    }

    private String formatDate(Date date){
        if(date != null){
            return formatter.format(date);
        }
        return "";
    }

    @Override
    public String toString() {
        return "JobWithCronTrigger [cronExpression=" + cronExpression + ",content=" + content + "]";
    }
}
