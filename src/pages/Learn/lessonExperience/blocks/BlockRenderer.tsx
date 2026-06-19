/**
 * Maps a {@link ContentBlock} to its component via the common block contract.
 * The `recap` block is rendered directly by the shell (it needs lesson-level
 * completion/mastery props), so it is not handled here.
 */
import React from 'react';
import type { BlockComponentProps } from './blockContract';
import { ConceptCard } from './ConceptCard';
import { AnnotatedCodeWalkthrough } from './AnnotatedCodeWalkthrough';
import { RunnablePlayground } from './RunnablePlayground';
import { PredictOutput } from './PredictOutput';
import { McqBlock } from './McqBlock';
import { FillInBlank } from './FillInBlank';
import { CodeTaskBuild } from './CodeTaskBuild';
import { ReflectionPrompt } from './ReflectionPrompt';

export const BlockRenderer: React.FC<BlockComponentProps> = (props) => {
    switch (props.block.type) {
        case 'conceptCard':
            return <ConceptCard {...props} />;
        case 'annotatedWalkthrough':
            return <AnnotatedCodeWalkthrough {...props} />;
        case 'runnablePlayground':
            return <RunnablePlayground {...props} />;
        case 'predictOutput':
            return <PredictOutput {...props} />;
        case 'mcq':
            return <McqBlock {...props} />;
        case 'fillInBlank':
            return <FillInBlank {...props} />;
        case 'codeTask':
            return <CodeTaskBuild {...props} />;
        case 'reflection':
            return <ReflectionPrompt {...props} />;
        case 'recap':
            return null; // rendered by the shell with lesson-level props
        default:
            return <ConceptCard {...props} />;
    }
};

export default BlockRenderer;
