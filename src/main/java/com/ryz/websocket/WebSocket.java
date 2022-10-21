package com.ryz.websocket;

import net.sf.json.JSONObject;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.PathParam;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * @ClassName
 * @Description TODO
 * @Author 15712
 * @Date 2022/9/28 17:35
 * @Version 1.0
 **/
@ServerEndpoint("/webSocket/{username}")
@Component
public class WebSocket {
    private static int onlineCount = 0;
    private static Map<String, String> IdToUserName = new ConcurrentHashMap<String, String>();
    private static Map<String, WebSocket> IdToSession = new ConcurrentHashMap<String, WebSocket>();
    private Session session;
    private String username;
    private String sessionId;

    @OnOpen
    public void onOpen(@PathParam("username") String username, Session session) throws IOException {

        this.username = username;
        this.session = session;
        this.sessionId = session.getId();

        addOnlineCount();

        IdToSession.put(this.sessionId,this);
        IdToUserName.put(this.sessionId, this.username);

        System.out.println("------------------WebSocket--------------------"+username+"已连接");
    }

    @OnClose
    public void onClose() throws IOException {
        System.out.println("------------------WebSocket--------------------"+username+"已关闭");
        IdToSession.remove(sessionId);
        IdToUserName.remove(sessionId);
        subOnlineCount();
    }

    @OnMessage
    public void onMessage(String message) throws IOException {
        System.out.println("------------------WebSocket 收到消息--------------------"+message);
        JSONObject jsonTo = JSONObject.fromObject(message);


        sendMessageTo(jsonTo.toString(), jsonTo.get("to").toString(),"");
    }

    @OnError
    public void onError(Session session, Throwable error) {
        System.out.println("------------------WebSocket--------------------"+session.getId()+"已关闭");
        error.printStackTrace();
    }

    public void sendMessageTo(String message, String To,String sessionId) throws IOException {
        // 根据用户名找到id
        List<String> idList = new ArrayList<String>();
        if(sessionId==null || "".equals(sessionId)){
            Set<String> ids = IdToUserName.keySet();
            for(String id : ids){
                if(IdToUserName.get(id).equals(To)){
                    idList.add(id);
                }
            }
        }else {
            idList.add(sessionId);
        }

        // 根据id找到session
        for(String id : idList){
            WebSocket webSocket = IdToSession.get(id);
            try {
                webSocket.session.getAsyncRemote().sendText(message);
            }catch (Exception e){
                e.printStackTrace();
                System.out.println("------------------WebSocket--------------------发消息异常");
            }
        }

    }

    public void sendMessageAll(String message) throws IOException {
        Set<String> ids = IdToSession.keySet();
        for (String id : ids) {
            IdToSession.get(id).session.getAsyncRemote().sendText(message);
        }
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        WebSocket.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        WebSocket.onlineCount--;
    }

    public static synchronized Map<String, WebSocket> getClients() {
        return IdToSession;
    }
}

