/**
 * Games Module - Exports all game classes
 * Provides a single import point for all game implementations
 */

export { BaseGame } from './base-game.js';
export { MurphGame } from './murph-game.js';
export { SkinsGame } from './skins-game.js';
export { KPGame } from './kp-game.js';
export { SnakeGame } from './snake-game.js';
export { WolfGame } from './wolf-game.js';

// Game factory function
import { GAME_TYPES } from '../constants.js';
import { MurphGame } from './murph-game.js';
import { SkinsGame } from './skins-game.js';
import { KPGame } from './kp-game.js';
import { SnakeGame } from './snake-game.js';
import { WolfGame } from './wolf-game.js';

/**
 * Create a game instance of the specified type
 * @param {string} gameType - The type of game to create
 * @param {Array} players - Array of player names
 * @param {Object} config - Game configuration
 * @returns {BaseGame} Game instance
 */
export function createGame(gameType, players, config = {}) {
    switch (gameType) {
        case GAME_TYPES.MURPH:
            return new MurphGame(players, config);
        case GAME_TYPES.SKINS:
            return new SkinsGame(players, config);
        case GAME_TYPES.KP:
            return new KPGame(players, config);
        case GAME_TYPES.SNAKE:
            return new SnakeGame(players, config);
        case GAME_TYPES.WOLF:
            return new WolfGame(players, config);
        default:
            throw new Error(`Unknown game type: ${gameType}`);
    }
}
