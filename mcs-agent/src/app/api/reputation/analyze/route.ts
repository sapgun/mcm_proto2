import { NextResponse } from 'next/server';
import { initializeAgent, getModule } from '@/lib/elizaos/core';
import { initializeReputationModule } from '@/lib/elizaos/reputation';

// 초기화 플래그
let isInitialized = false;

/**
 * 저장소 평판 분석 API
 */
export async function POST(request: Request) {
  // POST 메서드만 허용
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const data = await request.json();
    const { repoUrl } = data;

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL is required' },
        { status: 400 }
      );
    }

    // 첫 요청 시 ElizaOS Agent 초기화
    if (!isInitialized) {
      await initializeAgent();
      await initializeReputationModule();
      isInitialized = true;
    }

    // 평판 모듈 가져오기
    const reputationModule = getModule('reputation');
    
    if (!reputationModule) {
      return NextResponse.json({ error: 'Reputation module not initialized' }, { status: 500 });
    }
    
    const result = await reputationModule.analyzeReputation(repoUrl);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in repository reputation analysis API:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 