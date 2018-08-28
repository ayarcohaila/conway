import { combineReducers } from 'redux';
import {
  createNewBoard,
  step,
  cloneBoard,
  resizeBoard,
  setCells,
  getMinimumAllowableDimensions
} from './life';
import { actionTypes } from './actions';
import config from './config';

/**
 * generate next state from current state
 * @param {object} state
 * @returns {object} object of next state
 */
function stepNextState(state) {
  if (state.isConcluded) {
    return state;
  }

  const nextGeneration = state.generation + 1;
  const nextBoardResults = step(state.board);

  if (!nextBoardResults) {
    return {
      generation: nextGeneration,
      isConcluded: true,
      isPlaying: false
    };
  }

  const nextState = {
    board: nextBoardResults.board,
    minBoardWidth: nextBoardResults.minBoardWidth,
    minBoardHeight: nextBoardResults.minBoardHeight,
    generation: nextGeneration
  };

  if (state.generation === 0) {
    nextState.initialBoard = cloneBoard(state.board);
  }

  return nextState;
}

/**
 * generate next state on toggle cell from currnet state
 * @param {object} state
 * @param {number} r
 * @param {number} c
 * @returns {object} object of next state
 */
function toggleCellStartValueNextState(state, r, c) {
  const currVal = state.board[r][c];
  const nextVal = currVal ? 0 : 1;
  const nextBoard = setCells(state.board, [[r, c]], nextVal);
  const nextState = { board: nextBoard };
  const nextMinDims = getMinimumAllowableDimensions(nextBoard);

  if (nextMinDims[0] !== state.minBoardWidth) {
    nextState.minBoardWidth = nextMinDims[0];
  }

  if (nextMinDims[1] !== state.minBoardHeight) {
    nextState.minBoardHeight = nextMinDims[1];
  }

  return nextState;
}

/**
 * generate new board when resizing
 * @param {object} state
 * @param {number} w
 * @param {number} h
 * @returns {object} new board
 */
function resizeBoardNextState(state, w, h) {
  if (
    w >= config.INITIAL_MIN_BOARD_WIDTH &&
    w <= config.INITIAL_MAX_BOARD_WIDTH &&
    h >= config.INITIAL_MIN_BOARD_HEIGHT &&
    h <= config.INITIAL_MAX_BOARD_HEIGHT
  ) {
    const newBoard = resizeBoard(state.board, w, h);
    return newBoard ? { board: newBoard } : {};
  }

  return {};
}

function life(state = {}, action) {
  switch (action.type) {
    case actionTypes.RESET_BOARD:
      return {
        ...state,
        board:
          state.initialBoard ||
          createNewBoard(
            state.board[0].length,
            state.board.length,
            config.INITIAL_LIVE_CELLS
          ),
        generation: 0,
        isPlaying: false,
        isConcluded: false
      };

    case actionTypes.RESIZE_BOARD:
      return {
        ...state,
        ...resizeBoardNextState(state, action.width, action.height)
      };

    case actionTypes.PLAY:
      return {
        ...state,
        isPlaying: true
      };

    case actionTypes.PAUSE:
      return {
        ...state,
        isPlaying: false
      };

    case actionTypes.STEP:
      return {
        ...state,
        ...stepNextState(state)
      };

    case actionTypes.TOGGLE_CELL_START_VALUE:
      return {
        ...state,
        ...toggleCellStartValueNextState(state, action.r, action.c)
      };

    default:
      return state;
  }
}

const rootReducer = combineReducers({ life });

export default rootReducer;
