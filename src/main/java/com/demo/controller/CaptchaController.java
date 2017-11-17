package com.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Controller
public class CaptchaController {
    private Random random = new Random();

    @RequestMapping("/imagecode")
    @ResponseBody
    public void getImageCode(HttpServletRequest request, HttpServletResponse response) throws IOException {
        int height = 220;
        int width = 220;
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = (Graphics2D) image.getGraphics();
        // 读取本地图片作为背景
        // String picPath = request.getServletContext().getRealPath("/") ;
        // System.out.println("路径地址为：" + picPath);
        File file = ResourceUtils.getFile("classpath:static/images/user.png");
        // 将背景图片从高度25开始
        g.drawImage(ImageIO.read(file), 0, 25, width, height, null);
        g.drawRect(0, 0, width - 1, height - 1);
        // 设置文字
        Font font = new Font("宋体", Font.BOLD, 14);
        g.setFont(font);
        FontMetrics metrics = g.getFontMetrics();
        List<String> words = new ArrayList<>();
        List<Point> positions = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            // g.setColor(new Color(random.nextInt(50) + 200, random.nextInt(150) + 100, random.nextInt(50) + 200));
            g.setColor(Color.GREEN);
            String str = getRandomChinese();
            words.add(str);
            int strWidth = metrics.stringWidth(str);
            int strHeight = metrics.getHeight();
            positions = getRandomPostion(positions, width, height, strWidth, strHeight);
//            rotateText(g, str,random.nextDouble() * 180,a, b);
        }
        drawText(g, words, positions);
        g.setColor(Color.WHITE);
        g.drawString("  依次点击[ " + buildStringFromList(words) + "]", 0, 18);
        request.getSession().setAttribute("gap", buildPosFromList(positions));
        g.dispose();
        ImageIO.write(image, "jpg", response.getOutputStream());
    }

    private String getRandomChinese() {
        String str = null;
        int hs = (176 + random.nextInt(39));
        int ls = (161 + random.nextInt(93));
        byte[] b = new byte[]{new Integer(hs).byteValue(), new Integer(ls).byteValue()};
        try {
            str = new String(b, "GBK");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return str;
    }

    private void rotateText(Graphics2D g, String s, double angle, int x, int y) {
        g.translate(x, y);
        g.rotate(Math.PI * (angle / -180));
        g.drawString(s, 0, 0);
        g.rotate(Math.PI * angle / 180);
        g.translate(-x, -y);
    }

    private String buildStringFromList(List<String> list){
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3 ; i++) {
            String s = list.get(i);
            sb.append(s);
            sb.append(" ");
        }
        return sb.toString();
    }

    private String buildPosFromList(List<Point> positions){
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            Point point = positions.get(i);
            int x = (int)point.getX();
            int y = (int)point.getY();
            sb.append(x + ":" + y);
            sb.append(",");
        }
        return sb.deleteCharAt(sb.length() - 1).toString();
    }

    private boolean isValidPoint(List<Point> positionList, int x, int y, int width, int height){
        boolean flag = true;
        for(Point point: positionList){
            int baseX = (int)point.getX();
            int baseY = (int)point.getY();
            if(x + width < baseX || y + height < baseY || baseX + width < x || baseY + height < y){

            }else{
                flag = false;
                break;
            }
        }
        return flag;
    }

    private List<Point> getRandomPostion(List<Point> positionList, int width, int height, int strWidth, int strHeight){
        int a = random.nextInt(width - 100) + 50;
        int b = random.nextInt(height - 70) + 55;
        if(!isValidPoint(positionList, a, b, strWidth, strHeight)){
            positionList = getRandomPostion(positionList, width, height, strWidth, strHeight);
        }else{
            positionList.add(new Point(a, b));
        }
        return positionList;
    }

    private void drawText(Graphics g, List<String> words, List<Point> positions){
        for (int i = 0; i < words.size(); i++) {
            String chinese = words.get(i);
            Point point = positions.get(i);
            g.drawString(chinese, (int)point.getX(), (int)point.getY());
        }
    }

}
