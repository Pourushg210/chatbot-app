import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setConnectionStatus } from "@/store/slices/chatSlice";
import websocketService from "@/services/websocket";

export const useWebSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, token } = useSelector(
    (state: RootState) => state.auth
  );
  const { currentConversation } = useSelector((state: RootState) => state.chat);

  const connect = useCallback(
    (userId: string, authToken: string) => {
      if (!authToken) return;

      dispatch(setConnectionStatus("connecting"));
      websocketService.connect(userId, authToken);
    },
    [dispatch]
  );

  const disconnect = useCallback(() => {
    websocketService.disconnect();
    dispatch(setConnectionStatus("disconnected"));
  }, [dispatch]);

  const sendMessage = useCallback(
    (message: {
      content: string;
      sender: "user" | "bot";
      type: "text" | "voice";
      conversationId: string;
    }) => {
      return websocketService.sendMessage(message);
    },
    []
  );

  const sendTypingIndicator = useCallback(
    (conversationId: string, isTyping: boolean) => {
      websocketService.sendTypingIndicator(conversationId, isTyping);
    },
    []
  );

  const joinConversation = useCallback((conversationId: string) => {
    websocketService.joinConversation(conversationId);
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    websocketService.leaveConversation(conversationId);
  }, []);

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      const userId = `user-${Date.now()}`;
      connect(userId, token);
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Auto-join conversation when available
  useEffect(() => {
    if (currentConversation && websocketService.isConnected()) {
      joinConversation(currentConversation.id);

      return () => {
        leaveConversation(currentConversation.id);
      };
    }
  }, [currentConversation, joinConversation, leaveConversation]);

  return {
    isConnected: websocketService.isConnected(),
    sendMessage,
    sendTypingIndicator,
    joinConversation,
    leaveConversation,
  };
};
