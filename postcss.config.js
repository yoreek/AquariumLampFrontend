// postcss.config.js
import { purgeCSSPlugin } from '@fullhuman/postcss-purgecss'

export default {
    plugins: [
        // purgeCSSPlugin({
        //     content: [
        //         './index.html',
        //         './src/**/*.vue',
        //         './src/**/*.ts',
        //     ],
        //     defaultExtractor: content =>
        //         content.match(/[\w-/:]+(?<!:)/g) || [],
        //     // …any other PurgeCSS options…
        // }),
    ],
}
