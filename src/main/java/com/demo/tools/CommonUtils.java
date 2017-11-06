package com.demo.tools;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public class CommonUtils {
    public static boolean isEmpty(List<?> list){
        return list == null || list.size() == 0;
    }

    public static String getUUID(){
        return UUID.randomUUID().toString();
    }

    private static boolean isCollectionEmpty(Collection<?> collection){
        if(collection == null || collection.isEmpty()){
            return true;
        }
        return false;
    }

    public static boolean isObjectEmpty(Object object){
        if(object == null){
            return true;
        }else if(object instanceof String){
            if(((String)object).trim().length() == 0){
                return true;
            }
        }else if(object instanceof Collection){
            return isCollectionEmpty((Collection<?>)object);
        }
        return false;
    }
}
