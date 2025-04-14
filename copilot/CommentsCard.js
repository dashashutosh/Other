import React, { memo, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { CommentsV2, safeDateFormat, LOCAL_TIME_ZONE } from '@walmart/stride-ui-commons';
import { AppUtils } from '@gscope-mfe/app-bridge';
import { LocalizeLang } from '@gscope-mfe/common-components';
import { INPUT_DATE_FORMAT, DATE_TIME_FORMAT } from '../Constants';
const { localizeLang } = LocalizeLang.default;
/**
 * @type {React.FC<PropTypes.InferProps<typeof propTypes>>}
 */
const CommentsCard = ({ pComments, pEditable, pOnUpdateResponse }) => {
    const trans = localizeLang();
    const [sCommentModalOpen, setsCommentModalOpen] = useState(false);

    const { userInfo } = AppUtils.get();

    const onAddNewComment = (text) => {
        const comments = [];
        const date = format(new Date(), INPUT_DATE_FORMAT);
        comments.push({
            commentId: pComments?.length + 1,
            commentText: text,
            commentType: 'GENERAL',
            commentBy: userInfo?.loggedInUserName,
            commentTimestamp: safeDateFormat(date, DATE_TIME_FORMAT, LOCAL_TIME_ZONE),
            createdTs: date,
        });
        comments.push(...pComments);
        pOnUpdateResponse(comments);
    };

    const onDeleteComment = (commentId) => {
        const comments = pComments;
        const commentIndex = comments.findIndex((e) => e.commentId === commentId);
        comments.splice(commentIndex, 1);
        const updatedComments = comments?.map((comment, index) => ({ commentId: index + 1, ...comment }));
        pOnUpdateResponse(updatedComments);
    };

    const onUpdateComment = (comment) => {
        const date = format(new Date(), INPUT_DATE_FORMAT);
        const comments = pComments;
        const index = comments.findIndex((e) => e.commentId === comment.commentId);
        comments[index].commentText = comment.commentText;
        comments[index].commentTimestamp = safeDateFormat(date, DATE_TIME_FORMAT, LOCAL_TIME_ZONE);
        comments[index].lastUpdatedTs = date;
        pOnUpdateResponse(comments);
    };

    const labels = useMemo(
        () => ({
            commentsTitle: trans('title.comments'),
            newCommentTitle: trans('title.newComment'),
            editCommentTitle: trans('title.editComment'),
            addCommentText: trans('button.addComment'),
            cancelText: trans('button.cancel'),
            saveText: trans('button.save'),
            emptyCommentsText: trans('info.emptyComment'),
            emptyCommentsSubText: !pEditable ? '' : trans('info.emptyCommentActionHint'),
            commentLabel: trans('label.enterComment'),
        }),
        [trans],
    );

    return (
        <>
            <CommentsV2
                pIsEditMode={pEditable}
                pUserInfo={userInfo}
                pComments={pComments}
                pHeaderSeparator
                pModalControls={{
                    canCloseModal: sCommentModalOpen,
                    hasModalControl: true,
                }}
                pCallbacks={{
                    onDeleteComment,
                    onAddNewComment,
                    onUpdateComment,
                    resetCanCloseModal: () => setsCommentModalOpen(false),
                }}
                pLabels={labels}
            />
        </>
    );
};

const propTypes = {
    pComments: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    pEditable: PropTypes.bool.isRequired,
    pOnUpdateResponse: PropTypes.func.isRequired,
};

CommentsCard.propTypes = propTypes;

export default memo(CommentsCard);
