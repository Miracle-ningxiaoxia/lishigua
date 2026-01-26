'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function LoginForm() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // 页面加载后自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        inviteCode,
        redirect: false,
      });

      if (result?.error) {
        setError('邀请码无效，请重试');
        setInviteCode('');
        setIsLoading(false);
        return;
      }

      // 登录成功，添加短暂延迟增加仪式感
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.push(callbackUrl);
    } catch (err) {
      setError('登录失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* 星空背景 */}
      <div className="absolute inset-0">
        <div className="stars-layer-1" />
        <div className="stars-layer-2" />
        <div className="stars-layer-3" />
      </div>

      {/* 渐变光晕 */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* 主要内容 */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* 标题 */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-5xl font-light tracking-wider mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent font-['Dancing_Script']">
              The Portal
            </h1>
            <p className="text-gray-400 text-sm tracking-widest">
              拾光纪 · 专属入口
            </p>
          </motion.div>

          {/* 登录表单 */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="relative"
          >
            {/* 输入框光晕效果 */}
            <AnimatePresence>
              {isFocused && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
                    filter: 'blur(20px)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {/* 输入框容器 */}
            <div className="relative backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl">
              <motion.div
                animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <label
                  htmlFor="inviteCode"
                  className="block text-sm text-gray-400 mb-3 tracking-wide"
                >
                  邀请码
                </label>
                <input
                  ref={inputRef}
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  disabled={isLoading}
                  className="w-full px-4 py-4 bg-black/30 border border-white/20 rounded-xl text-white text-center text-lg tracking-widest placeholder-gray-500 focus:outline-none focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 disabled:opacity-50"
                  placeholder="• • • • • •"
                  autoComplete="off"
                  spellCheck={false}
                />
              </motion.div>

              {/* 错误提示 */}
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-400 text-sm mt-3 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* 提交按钮 */}
              <motion.button
                type="submit"
                disabled={isLoading || !inviteCode}
                className="w-full mt-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium tracking-wider hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      验证中...
                    </span>
                  ) : (
                    '进入拾光纪'
                  )}
                </span>
                
                {/* 按钮光效 */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </div>
          </motion.form>

          {/* 底部提示 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-center mt-8 text-gray-500 text-xs tracking-wider"
          >
            只有拥有专属邀请码的成员才能进入
          </motion.p>
        </motion.div>
      </div>

      {/* 星空样式 */}
      <style jsx>{`
        .stars-layer-1,
        .stars-layer-2,
        .stars-layer-3 {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 50px 50px, #ddd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
            radial-gradient(2px 2px at 90px 10px, #eee, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.3;
        }

        .stars-layer-1 {
          animation: twinkle 3s ease-in-out infinite;
        }

        .stars-layer-2 {
          background-size: 350px 350px;
          animation: twinkle 5s ease-in-out infinite reverse;
          opacity: 0.2;
        }

        .stars-layer-3 {
          background-size: 500px 500px;
          animation: twinkle 7s ease-in-out infinite;
          opacity: 0.1;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
