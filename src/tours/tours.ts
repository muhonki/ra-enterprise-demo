import { TourType } from '@react-admin/ra-tour';
import { fireEvent } from '@testing-library/react';
import { endOfYesterday } from 'date-fns';
import randomCommandBuilder from './randomCommandBuilder';
import { generateIdentity } from './randomLockBuilder';

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
const interval = (callback, intervalMs, expirationMs) =>
    new Promise(resolve => {
        const intervalRef = setInterval(callback, intervalMs);
        setTimeout(() => {
            clearInterval(intervalRef);
            resolve();
        }, expirationMs);
    });

let newCommandsIds: number[] = [];

const tours: { [id: string]: TourType } = {
    'ra-markdown': {
        before: async ({ redirect }) => {
            redirect('/products');
            await timeout(1000); // would be so awesome if redirect was awaitable!
        },
        steps: [
            {
                target: `[data-tour-id='grid-line'] > a:nth-child(${getRandomInt(
                    1,
                    5
                )})`,
                disableBeacon: true,
                content:
                    "This is a poster, one of the products our shop is selling, let's go to its details",
                joyrideProps: {
                    styles: {
                        beacon: {
                            marginTop: -100,
                        },
                    },
                },
                after: ({ target, redirect }) => {
                    const productUrl = target.getAttribute('href').slice(1);
                    redirect(productUrl);
                },
            },
            {
                target: "[data-tour-id='description-tab']",
                content: 'The markdown editor is in the description tab',
                after: ({ target }) => {
                    target.click();
                },
            },
            {
                target: '.tui-editor-defaultUI',
                content:
                    'Right here. Try playing with its markdown, make it bold, add headlines!',
            },
            {
                target: '.te-switch-button.wysiwyg',
                content: 'By default, you are in WYSIWYG mode.',
            },
            {
                target: '.te-switch-button.markdown',
                content:
                    'But you can switch to raw markdown edition with this button.',
            },
            {
                target: '[data-testid=product-edit-preview]',
                content:
                    'Parsed markdown can then be displayed in a preview or wherever you want.',
            },
        ],
    },
    'ra-preferences': {
        steps: [
            {
                target: "button[aria-label='Toggle Theme']",
                disableBeacon: true,
                content:
                    'ra-preferences comes with a lot of built-in modules, like this theme switcher. Try it: it works!',
            },
            {
                target: "button[aria-label='Toggle Theme'] + button",
                content: 'Or this language switcher...',
                after: ({ redirect }) => {
                    const params = JSON.stringify({
                        last_seen_gte: endOfYesterday().toISOString(),
                        nb_commands_gte: 1,
                    });

                    redirect(
                        `/customers?filter=${encodeURIComponent(
                            params
                        )}&order=DESC&page=1&perPage=25&sort=last_seen`
                    );
                },
            },
            {
                target: "button[aria-label='Save current query...']",
                content:
                    "It features persisted queries too. For example, let's persist the filters for today visitors who actually ordered something.",
                after: async ({ target }) => {
                    target.click();
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const nameInput = document.querySelector(
                        'body > .MuiDialog-root #name'
                    );

                    if (!nameInput) {
                        return;
                    }

                    fireEvent.change(nameInput, {
                        target: { value: 'Today customers' },
                    });
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const saveButton: HTMLButtonElement | null = document.querySelector(
                        'body > .MuiDialog-root button:nth-child(2)'
                    );
                    if (!saveButton) {
                        return;
                    }
                    fireEvent.click(saveButton);
                },
            },
            {
                target: '#persisted-queries ul',
                content: "It's persisted locally in the browser now!",
                after: ({ redirect }) => {
                    redirect('/customers');
                },
            },
            {
                target: 'button[aria-controls=user-preference-menu]',
                content:
                    'It even has more advanced components like this list customization tool.',
                disableBeacon: false,
                after: ({ target }) => {
                    target.click();
                },
            },
            {
                target: '#user-preference-menu .MuiPaper-root',
                content:
                    'Where you can select how you want the list to be displayed, or the information you want to see.',
                joyrideProps: {
                    styles: {
                        options: {
                            zIndex: 10000,
                        },
                    },
                },
                after: () => {
                    const menuOverlay: HTMLElement | null = document.querySelector(
                        'body > .MuiPopover-root div[aria-hidden=true]'
                    );
                    if (!menuOverlay) {
                        return;
                    }
                    menuOverlay.click();
                },
            },
            {
                before: ({ setTourPreferences, state }) => {
                    setTourPreferences(state);
                },
                target: 'body',
                content:
                    'It exposes simple hooks so that you can actually save whatever you want, too. For instance, the state of this particular step. Try to reload the page!',
                joyrideProps: {
                    styles: {
                        options: {
                            arrowColor: 'transparent',
                        },
                    },
                },
                after: ({ setTourPreferences }) => {
                    setTourPreferences({});
                },
            },
        ],
    },
    'ra-tree': {
        before: async ({ redirect }) => {
            redirect('/categories/5');
            await timeout(1000); // would be so awesome if redirect was awaitable!
        },
        steps: [
            {
                target: '.rc-tree',
                content:
                    'ra-tree helps handling trees with ease, no matter the data structure you use on the backend',
                disableBeacon: true,
            },
            {
                before: ({ target }) => {
                    interval(
                        () => {
                            const switcher = target.querySelector(
                                '.rc-tree-switcher.rc-tree-switcher_close'
                            );

                            if (switcher) {
                                switcher.click();
                            }
                        },
                        500,
                        4000
                    );
                },
                target: '.rc-tree',
                content:
                    'It supports expanding or collapsing nodes for an infinite amount of levels',
                after: async ({ target }) => {
                    await interval(
                        () => {
                            const switcher = target
                                // not the first line or it collapses all the tree
                                .querySelector(
                                    '.rc-tree-treenode:not(:nth-child(1)) .rc-tree-switcher.rc-tree-switcher_open'
                                );

                            if (switcher) {
                                switcher.click();
                            }
                        },
                        500,
                        2000
                    );
                },
            },
            {
                before: ({ redirect }) => {
                    setTimeout(() => {
                        redirect('/categories/create');
                    }, 4000);
                },
                target: '[aria-label="Add a category of products"]',
                content:
                    'You can even add a new category, or reorder them, try it!',
            },
        ],
    },
    'ra-realtime': {
        before: async () => {
            localStorage.setItem('batchLevel', '0');
        },
        steps: [
            {
                before: async ({ dataProvider }) => {
                    localStorage.setItem('batchLevel', '0');

                    [[1], [2], [3], [4]].reduce(
                        acc =>
                            acc.then(async () => {
                                const {
                                    data: customers,
                                } = await dataProvider.getList('customers', {
                                    filter: { has_ordered: true },
                                    pagination: { page: 1, perPage: 100 },
                                    sort: { field: 'id', order: 'ASC' },
                                });
                                // Add a new Order
                                const {
                                    data: newCommand,
                                } = await dataProvider.create('commands', {
                                    data: randomCommandBuilder(1, customers),
                                });

                                newCommandsIds.push(newCommand.id);
                                // Then notify the Real-time dataProvider
                                const topic = 'resource/commands';
                                dataProvider.publish(topic, {
                                    type: 'created',
                                    topic: topic,
                                    payload: { ids: [newCommand.id] },
                                    date: new Date(),
                                });
                            }),
                        timeout(1)
                    );
                    await timeout(1500); // would be so awesome if redirect was awaitable!
                },
                target: '[data-testid="commands-menu"]',
                content: "Seems like you just had new orders, let's check...",
                disableBeacon: true,
                joyrideProps: {
                    hideBackButton: true,
                },
                after: async ({ redirect }) => {
                    localStorage.setItem('batchLevel', '1');
                    await timeout(500);
                    redirect('/commands');
                },
            },
            {
                target: '[data-testid=order-ordered-datagrid]',
                content: 'Your new orders can stand-out from others',
                joyrideProps: {
                    hideBackButton: true,
                },
            },
            {
                before: async ({ dataProvider }) => {
                    localStorage.setItem('batchLevel', '2');
                    const { data: customers } = await dataProvider.getList(
                        'customers',
                        {
                            filter: { has_ordered: true },
                            pagination: { page: 1, perPage: 100 },
                            sort: { field: 'id', order: 'ASC' },
                        }
                    );
                    // Add a new Order
                    const { data: newCommand1 } = await dataProvider.create(
                        'commands',
                        {
                            data: randomCommandBuilder(2, customers),
                        }
                    );
                    newCommandsIds.push(newCommand1.id);
                    const { data: newCommand2 } = await dataProvider.create(
                        'commands',
                        {
                            data: randomCommandBuilder(2, customers),
                        }
                    );
                    newCommandsIds.push(newCommand2.id);
                    // Then notify the Real-time dataProvider
                    const topic = 'resource/commands';
                    dataProvider.publish(topic, {
                        type: 'created',
                        topic,
                        payload: { ids: [newCommand1.id, newCommand2.id] },
                        date: new Date(),
                    });
                    await timeout(1000);
                },
                target: '[data-testid=order-ordered-datagrid]',
                content:
                    "And newest orders even appear while you're on the page",
                joyrideProps: {
                    hideBackButton: true,
                },
                after: async ({ dataProvider, dispatch, redirect }) => {
                    // Generate a lock on Products #1, #2 and #5
                    await Promise.all(
                        [1, 2, 5].map(recordId => {
                            return dataProvider
                                .lock('products', {
                                    recordId,
                                    identity: generateIdentity(),
                                })
                                .then(({ data: lock }) => {
                                    dispatch({
                                        type: 'RA/LOCK_SUCCESS',
                                        payload: {
                                            data: lock,
                                        },
                                        meta: {
                                            fetchResponse: 'RA/LOCK',
                                            resource: 'products',
                                            recordId,
                                        },
                                    });
                                });
                        })
                    );

                    // Sort by id because the locked product has the id #0
                    redirect('/products?order=ASC&page=1&perPage=20&sort=id');
                },
            },
            {
                before: async ({ dataProvider, dispatch }) => {
                    await timeout(100);

                    // Unlock the Products #1 after a few seconds

                    const lockTile = global.document.querySelector(
                        '[data-productid="1"]'
                    );

                    if (lockTile instanceof HTMLElement) {
                        const recordId = parseInt(
                            lockTile.dataset.productid + '',
                            10
                        );

                        const identity = lockTile.dataset.lockidentity;

                        setTimeout(() => {
                            dataProvider
                                .unlock('products', {
                                    recordId,
                                    identity,
                                })
                                .then(({ data: lock }) => {
                                    dispatch({
                                        type: 'RA/UNLOCK_SUCCESS',
                                        payload: {
                                            data: lock,
                                        },
                                        meta: {
                                            fetchResponse: 'RA/UNLOCK',
                                            resource: 'products',
                                            recordId,
                                        },
                                    });
                                });
                        }, 4000);
                    }
                },
                target: '[data-testid=productlocktile]',
                content:
                    'You can lock resources in realtime (this one will be unlocked in a few seconds)',
                joyrideProps: {
                    hideBackButton: true,
                },
                after: async ({ dataProvider, dispatch, refresh }) => {
                    // Reset the locks on Products #2 and #5
                    // The lock on Procuct #1 has been deleted during the scenario
                    await Promise.all(
                        [2, 5].map(recordId => {
                            const lockTile = global.document.querySelector(
                                `[data-productid="${recordId}"]`
                            );
                            if (lockTile instanceof HTMLElement) {
                                const identity = lockTile.dataset.lockidentity;

                                return dataProvider
                                    .unlock('products', {
                                        recordId,
                                        identity,
                                    })
                                    .then(({ data: lock }) => {
                                        dispatch({
                                            type: 'RA/UNLOCK_SUCCESS',
                                            payload: {
                                                data: lock,
                                            },
                                            meta: {
                                                fetchResponse: 'RA/UNLOCK',
                                                resource: 'products',
                                                recordId,
                                            },
                                        });
                                    });
                            }
                            return Promise.resolve();
                        })
                    ).then(() => {
                        refresh();
                    });
                },
            },
        ],
        after: async ({ dataProvider, refresh }) => {
            localStorage.setItem('batchLevel', '0');
            // Reset new Orders
            // We have to delete them to avoid having them reappear if the tour is restarted
            await dataProvider.deleteMany('commands', {
                ids: newCommandsIds,
            });

            refresh();
            newCommandsIds = [];
        },
    },
    'ra-editable-datagrid': {
        before: async ({ redirect }) => {
            redirect('/stores');
            await timeout(1000); // would be so awesome if redirect was awaitable!
        },
        steps: [
            {
                target:
                    '[data-testid="store-datagrid"] > tbody > tr:first-child',
                content:
                    "Hovering on a row shows a toolbar allowing to either edit or delete the record. Let's see what happens when editing a row by clicking on the Edit button (or by directly clicking inside the row)",
            },
            {
                before: ({ target }) => {
                    target.querySelector('td:nth-child(2)').click();
                },
                target:
                    '[data-testid="store-datagrid"] > tbody > tr:first-child',
                content:
                    "You can edit a record without leaving the Datagrid! Let's change the address.",
                after: ({ target }) => {
                    fireEvent.change(target.querySelector('#address'), {
                        target: { value: '10 rue de Rivoli' },
                    });
                },
            },
            {
                target:
                    '[data-testid="store-datagrid"] > tbody > tr:first-child button:first-child',
                content:
                    'After edition, just click on the Save button in the row',
                after: ({ target }) => {
                    target.click();
                },
            },
            {
                target: '[aria-label="Create"]',
                content: 'The Editable Datagrid also supports inline creation',
                after: ({ target }) => {
                    target.click();
                },
            },
            {
                after: ({ target }) => {
                    fireEvent.change(target.querySelector('#city'), {
                        target: { value: 'Nantes' },
                    });
                    fireEvent.change(target.querySelector('#country'), {
                        target: { value: 'France' },
                    });
                    fireEvent.change(target.querySelector('#address'), {
                        target: { value: '5 rue du château' },
                    });
                    fireEvent.change(target.querySelector('#created_at'), {
                        target: { value: '2020-08-04' },
                    });
                },
                target:
                    '[data-testid="store-datagrid"] > tbody > tr:first-child',
                content:
                    'A row edition / creation form can contain Inputs of any type (text, date, number, etc.).',
            },
            {
                target:
                    '[data-testid="store-datagrid"] > tbody > tr:first-child button:first-child',
                content:
                    'Click on the Save button to submit the form and create a new record.',
                after: ({ target }) => {
                    target.click();
                },
            },
        ],
    },
    'ra-navigation-breadcrumb': {
        before: async ({ redirect }) => {
            redirect('/products');
            await timeout(1000); // would be so awesome if redirect was awaitable!
        },
        steps: [
            {
                target: "[aria-label='Breadcrumb'] li:nth-child(2)",
                content:
                    'The breadcrumb indicates that we are on the posters page',
                disableBeacon: true,
                joyrideProps: {
                    disableScrolling: true,
                },
            },
            {
                target: `[data-tour-id='grid-line'] > a:nth-child(${getRandomInt(
                    1,
                    5
                )})`,
                disableBeacon: true,
                content: "Let's edit one of these posters",
                after: ({ target, redirect }) => {
                    const productUrl = target.getAttribute('href').slice(1);
                    redirect(productUrl);
                },
            },
            {
                target: "[aria-label='Breadcrumb'] li:nth-child(3)",
                content:
                    'The breadcrumb has changed to follow us to this Edit page',
                disableBeacon: true,
                joyrideProps: {
                    scrollOffset: 50,
                },
            },
            {
                target: '[data-testid="commands-menu"]',
                content: "Let's try to navigate away using the Menu entry",
                disableBeacon: true,
                joyrideProps: {
                    disableScrolling: true,
                },
                after: ({ redirect }) => {
                    redirect('/commands');
                },
            },
            {
                target: "[aria-label='Breadcrumb'] li:nth-child(2)",
                content: 'The breadcrumb keeps showing our exact location.',
                disableBeacon: true,
                joyrideProps: {
                    disableScrolling: true,
                },
            },
            {
                target: "[aria-label='Breadcrumb'] li:nth-child(1)",
                content:
                    "Users can click on the breadcrumb items directly to navigate.\nLet's go to the home page",
                disableBeacon: true,
                joyrideProps: {
                    disableScrolling: true,
                },
                after: ({ redirect }) => {
                    redirect('/');
                },
            },
            {
                target: "[aria-label='Breadcrumb']",
                content:
                    "By default, there is no breacrumb displayed on the home page.\n Now it's your turn to use the Breadcrumb component to build you own breadcrumb path!",
                disableBeacon: true,
                joyrideProps: {
                    disableScrolling: true,
                },
            },
        ],
    },
    'ra-search': {
        steps: [
            {
                target: '[data-testid="search"]',
                content:
                    'This is the smart Omnisearch box. It allows users to search across all resources. ',
                after: ({ target }) => {
                    fireEvent.change(target.querySelector('input'), {
                        target: { value: 'B' },
                    });
                    return new Promise(resolve => setTimeout(resolve, 1000));
                },
            },
            {
                target: '[data-testid="search-panel"]',
                content:
                    "You can customize the search results at will and redirect to any resource. For example, let's click on the first customer",
                after: ({ target }) => {
                    fireEvent.click(
                        target.querySelector('[data-testid="customer"]')
                    );
                },
            },
            {
                target: '[data-testid="search"]',
                content:
                    'The search query and results are preserved after navigation',
                before: ({ target }) => {
                    setTimeout(
                        () => target.querySelector('input').focus(),
                        1000
                    );
                },
            },
        ],
    },
};

export default tours;
