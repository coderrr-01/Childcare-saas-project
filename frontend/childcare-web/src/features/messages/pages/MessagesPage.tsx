import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  Badge,
  Divider,
  Paper,
  Avatar,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Fade,
} from '@mui/material';
import { Send, AttachFile, Search, ArrowBack } from '@mui/icons-material';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { mockConversations, mockMessages } from '@/mock/messages';
import { mockChildren } from '@/mock/children';
import type { Conversation, Message as MessageType } from '@/types';
import { formatRelativeTime, formatTime } from '@/utils/formatters';
import { generateColor } from '@/utils/formatters';

function MessagesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, MessageType[]>>(mockMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = useMemo(() => {
    if (!searchQuery) return mockConversations;
    const q = searchQuery.toLowerCase();
    return mockConversations.filter(
      (c) =>
        c.subject.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const selectedConversation = useMemo(
    () => mockConversations.find((c) => c.id === selectedConversationId) ?? null,
    [selectedConversationId]
  );

  const conversationMessages = useMemo(
    () => (selectedConversationId ? messages[selectedConversationId] ?? [] : []),
    [selectedConversationId, messages]
  );

  const child = useMemo(
    () =>
      selectedConversation?.childId
        ? mockChildren.find((c) => c.id === selectedConversation.childId)
        : null,
    [selectedConversation]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    const msg: MessageType = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversationId,
      senderId: 'current-user',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: true,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] ?? []), msg],
    }));
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => setSelectedConversationId(null);

  const renderConversationList = () => (
    <Box
      sx={{
        width: isMobile ? '100%' : 360,
        minWidth: isMobile ? '100%' : 360,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Divider />
      <List sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {filteredConversations.length === 0 ? (
          <EmptyState
            title="No conversations found"
            description="Try a different search term"
            icon="chat"
          />
        ) : (
          filteredConversations.map((conv) => (
            <ListItem
              key={conv.id}
              button
              selected={selectedConversationId === conv.id}
              onClick={() => setSelectedConversationId(conv.id)}
              sx={{
                py: 1.5,
                bgcolor: conv.unreadCount > 0 ? 'action.hover' : 'transparent',
                '&.Mui-selected': {
                  bgcolor: 'primary.50',
                },
              }}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    conv.unreadCount > 0 ? (
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar
                    sx={{
                      bgcolor: generateColor(conv.subject),
                      color: 'common.white',
                      fontWeight: 600,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {conv.subject.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography
                      variant="body2"
                      fontWeight={conv.unreadCount > 0 ? 700 : 400}
                      noWrap
                      sx={{ flex: 1, mr: 1 }}
                    >
                      {conv.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                      {formatRelativeTime(conv.lastMessageAt)}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.25 }}>
                    <Typography
                      variant="caption"
                      color={conv.unreadCount > 0 ? 'text.primary' : 'text.secondary'}
                      noWrap
                      sx={{
                        flex: 1,
                        mr: 1,
                        fontWeight: conv.unreadCount > 0 ? 500 : 400,
                      }}
                    >
                      {conv.lastMessagePreview}
                    </Typography>
                    {conv.unreadCount > 0 && (
                      <Badge
                        badgeContent={conv.unreadCount}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: 10,
                            height: 18,
                            minWidth: 18,
                          },
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );

  const renderConversationView = () => {
    if (!selectedConversation) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.50',
          }}
        >
          <EmptyState
            title="Select a conversation"
            description="Choose a conversation from the list to start messaging"
            icon="chat"
          />
        </Box>
      );
    }

    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'grey.50' }}>
        {/* Conversation Header */}
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
          }}
        >
          {isMobile && (
            <IconButton onClick={handleBack} size="small">
              <ArrowBack />
            </IconButton>
          )}
          <Avatar
            sx={{
              bgcolor: generateColor(selectedConversation.subject),
              color: 'common.white',
              fontWeight: 600,
            }}
          >
            {selectedConversation.subject.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedConversation.subject}
            </Typography>
            {selectedConversation.participantIds && selectedConversation.participantIds.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                {selectedConversation.participantIds.length} participant{selectedConversation.participantIds.length > 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            px: 2,
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {conversationMessages.map((msg, index) => {
            const isSender = msg.senderId === 'current-user';
            const showTimestamp =
              index === 0 ||
              new Date(msg.timestamp).toDateString() !==
                new Date(conversationMessages[index - 1].timestamp).toDateString();

            return (
              <Box key={msg.id}>
                {showTimestamp && (
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                      {new Date(msg.timestamp).toLocaleDateString(undefined, {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Typography>
                  </Box>
                )}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: isSender ? 'flex-end' : 'flex-start',
                    mb: 0.5,
                  }}
                >
                  <Fade in>
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.5,
                        py: 1,
                        maxWidth: '75%',
                        bgcolor: isSender ? 'primary.main' : 'grey.200',
                        color: isSender ? 'common.white' : 'text.primary',
                        borderRadius: isSender
                          ? '16px 16px 4px 16px'
                          : '16px 16px 16px 4px',
                        position: 'relative',
                      }}
                    >
                      {!isSender && (
                        <Typography variant="caption" sx={{ fontWeight: 600 }} sx={{ color: 'primary.main' }}>
                          {msg.senderName}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {msg.content}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          textAlign: 'right',
                          mt: 0.25,
                          opacity: 0.7,
                          fontSize: '0.65rem',
                          color: isSender ? 'common.white' : 'text.secondary',
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Paper>
                  </Fade>
                </Box>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
          }}
        >
          <IconButton size="small" color="primary">
            <AttachFile />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            slotProps={{
              input: {
                sx: {
                  borderRadius: 3,
                  bgcolor: 'grey.100',
                  '& fieldset': { border: 'none' },
                },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!newMessage.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'common.white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&.Mui-disabled': { bgcolor: 'grey.300', color: 'grey.500' },
            }}
          >
            <Send fontSize="small" />
          </IconButton>
        </Paper>
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <PageHeader
        title="Messages"
        subtitle="Communicate with parents and staff"
      />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          mx: isMobile ? 0 : 2,
          mb: 2,
          borderRadius: isMobile ? 0 : 2,
          border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
        }}
      >
        {(isMobile && !selectedConversationId) || !isMobile ? renderConversationList() : null}
        {(isMobile && selectedConversationId) || !isMobile ? renderConversationView() : null}
      </Box>
    </Box>
  );
}

export default MessagesPage;
