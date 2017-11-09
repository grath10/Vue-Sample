package com.demo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
@MapperScan("com.demo.mapper")
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
        // testDemo();
    }

    private static void testDemo(){
        int imageWidth = 200;
        int imageHeight = 200;
        BufferedImage image = new BufferedImage(imageWidth, imageHeight, BufferedImage.TYPE_INT_RGB);
        Graphics graphics = image.getGraphics();
        Font font = new Font("宋体", Font.ITALIC, 16);
        graphics.setFont(font);
        graphics.setColor(new Color(246,96,0));
        graphics.fillRect(0,0,imageWidth,imageHeight);
        graphics.setColor(Color.BLACK);
        String strArr[] = new String[]{"天", "七", "清", "翻"};
        List<String> list = Arrays.asList(strArr);
        for (int i = 0; i < list.size(); i++) {
            String s = list.get(i);
            FontMetrics metrics = graphics.getFontMetrics();
            int strWidth = metrics.stringWidth(s);
            int strHeight = metrics.getHeight();
            System.out.println("=====宽度：" + strWidth + ", 高度:" + strHeight + "======");
            graphics.drawString(s, 0 + 10 * i, 20 + 10 * i);
        }
        try {
            ImageIO.write(image, "png", new File("D:\\abc.png"));
        }catch (Exception e){
            e.printStackTrace();
        }
        graphics.dispose();
    }
}
