import React, { FC } from 'react';
import {
    Box,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CommentIcon from '@material-ui/icons/Comment';

import { SearchListItemLink } from './index';
import { useTranslate } from 'react-admin';
import { LinkedData } from './LinkedData';

const secondaryTypographyProps = {
    component: 'div',
};

export const ProductListItem: FC<any> = props => {
    const { data, onClick } = props;
    const { content } = data;

    const classes = useProductListItemStyles();
    const translate = useTranslate();

    if (!content) {
        return null;
    }

    return (
        <ListItem
            button
            component={SearchListItemLink}
            data={data}
            onClick={onClick}
            alignItems="flex-start"
            className={classes.root}
        >
            <ListItemAvatar className={classes.avatar}>
                <div className={classes.art}>
                    <img src={content.thumbnail} alt={content.reference} />
                </div>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography color="textPrimary">
                        {content.reference}
                    </Typography>
                }
                secondary={
                    content.reviews > 0 ? (
                        <Box
                            component="ul"
                            display="flex"
                            justifyContent="space-between"
                            padding={0}
                            marginTop={1}
                            marginBottom={1}
                        >
                            <LinkedData
                                icon={<CommentIcon />}
                                label={translate('resources.reviews.name', {
                                    smart_count: 2,
                                })}
                                to={`/reviews?filter=%7B"product_id"%3A${content.id}%7D`}
                            >
                                {content.reviews}
                            </LinkedData>
                        </Box>
                    ) : undefined
                }
                // @ts-ignore Could not make TS happy
                secondaryTypographyProps={secondaryTypographyProps}
            />
        </ListItem>
    );
};

const useProductListItemStyles = makeStyles(theme => ({
    root: {
        textDecoration: 'none',
        '&:hover': {
            textDecoration: 'none',
        },
        '& a': {
            textDecoration: 'none',
        },
        '& a:hover': {
            textDecoration: 'none',
        },
    },
    avatar: {
        width: 64,
        height: 64,
        paddingRight: theme.spacing(2),
    },
    mat: {
        background: theme.palette.background.paper,
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.5) inset',
    },
    art: {
        '& img': {
            width: '100%',
        },
    },
}));
