import { db } from './index';

export function get_user_likes_and_saves(user_id: number | undefined, content_ids: number[]): { user_likes: Set<number>, user_saves: Set<number> } {
    if (!user_id || content_ids.length === 0) {
        return { user_likes: new Set<number>(), user_saves: new Set<number>() };
    }

    const user_likes = new Set<number>();
    const user_saves = new Set<number>();

    const likeStmt = db.prepare('SELECT 1 FROM likes WHERE user_id = ? AND target_id = ?');
    const saveStmt = db.prepare('SELECT 1 FROM saves WHERE user_id = ? AND target_id = ?');

    db.transaction(() => {
        for (const content_id of content_ids) {
            if (likeStmt.get(user_id, content_id)) {
                user_likes.add(content_id);
            }
            if (saveStmt.get(user_id, content_id)) {
                user_saves.add(content_id);
            }
        }
    })();

    return { user_likes, user_saves };
}

type InteractionType = 'likes' | 'saves';

export function add_interaction(type: InteractionType, userId: number, contentId: number): void {
    const table = `${type}s`;
    const query = `INSERT OR IGNORE INTO ${table} (user_id, target_id, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)`;
    db.prepare(query).run(userId, contentId);
}

export function remove_interaction(type: InteractionType, userId: number, contentId: number): void {
    const table = `${type}s`;
    const query = `DELETE FROM ${table} WHERE user_id = ? AND target_id = ?`;
    db.prepare(query).run(userId, contentId);
}