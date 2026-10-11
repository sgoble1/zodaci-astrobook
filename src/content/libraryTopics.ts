import { registerPrivateValue } from '@/lib/privateEditionStore';
import type { Topic } from '@/content/topics';

/** Source-linked learning topics; interpretations are not quotations or biographical claims. */
export let LIBRARY_TOPICS: Topic[] = [];
registerPrivateValue("libraryTopics", "LIBRARY_TOPICS", value => { LIBRARY_TOPICS = value as typeof LIBRARY_TOPICS; }, []);
