import { getAdvanced } from '../../utils';

export default node => {
    return {
        content: node.innerHTML,
        widgetList: node.querySelectorAll(
            '.widget, .admin__data-grid-outer-wrap, [data-element^="google-carousel-widget-review_"]'
        ),
        ...getAdvanced(node)
    };
};
