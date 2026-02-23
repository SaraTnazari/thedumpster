import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, User, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface MovieCommentsProps {
  movieId: string;
}

export const MovieComments = ({ movieId }: MovieCommentsProps) => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const [commentCount, setCommentCount] = useState(0);

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-scroll to newest comment
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error, count } = await supabase
          .from('comments')
          .select(
            `
            id,
            content,
            created_at,
            user_id,
            profiles:user_id(username, avatar_url)
          `,
            { count: 'exact' }
          )
          .eq('movie_id', movieId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching comments:', error);
          toast({
            title: 'Error',
            description: 'Failed to load comments',
            variant: 'destructive',
          });
          return;
        }

        setComments(data || []);
        setCommentCount(count || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`comments:${movieId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `movie_id=eq.${movieId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchComments();
          } else if (payload.eventType === 'DELETE') {
            setComments((prev) =>
              prev.filter((c) => c.id !== (payload.old as Comment).id)
            );
            setCommentCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [movieId, toast]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Not signed in',
        description: 'Please sign in to post a comment',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Empty comment',
        description: 'Please write something before posting',
        variant: 'destructive',
      });
      return;
    }

    if (newComment.length > 1000) {
      toast({
        title: 'Comment too long',
        description: 'Comments must be 1000 characters or less',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('comments').insert([
        {
          movie_id: movieId,
          user_id: user.id,
          content: newComment,
        },
      ]);

      if (error) {
        console.error('Error posting comment:', error);
        toast({
          title: 'Error',
          description: 'Failed to post comment',
          variant: 'destructive',
        });
        return;
      }

      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment posted!',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete comment',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Comment deleted',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-card rounded-xl border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Discussion</h3>
        <span className="text-sm text-muted-foreground ml-auto">
          {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Comments Section */}
      <div className="max-h-[500px] overflow-y-auto mb-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-background rounded-lg p-4 group hover:bg-muted transition-colors"
              >
                {/* Comment Header */}
                <div className="flex items-center gap-3 mb-2">
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt={comment.profiles.username || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {comment.profiles?.username || 'TrashPanda'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(comment.created_at)}
                    </p>
                  </div>
                  {user?.id === comment.user_id && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-xs text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Delete
                    </motion.button>
                  )}
                </div>

                {/* Comment Content */}
                <p className="text-sm text-foreground leading-relaxed break-words">
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* Input Section */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="flex gap-3">
          <input
            type="text"
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            maxLength={1000}
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            disabled={submitting}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </form>
      ) : (
        <div className="text-center py-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Sign in to join the discussion
          </p>
        </div>
      )}

      {/* Character count */}
      {user && newComment && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mt-2 text-right"
        >
          {newComment.length}/1000
        </motion.p>
      )}
    </motion.div>
  );
};
