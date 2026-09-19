import { Mail01Icon, ArrowUpRight01Icon, BugIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Surface, Button, Pill } from '../../components/ds';

const REPO_URL = 'https://github.com/rofiperlungoding/CatCoder';
const CONTACT_EMAIL = 'hello@catcoder.online';

export const ContactPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="cc-root pt-32 pb-24 px-4 sm:px-6">
            <div className="max-w-[760px] mx-auto">
                <div className="text-center max-w-2xl mx-auto">
                    <Pill variant="brand" className="mb-5">Contact</Pill>
                    <h1 className="cc-display text-4xl sm:text-5xl font-bold" style={{ color: 'var(--cc-tx-1)' }}>
                        Get in touch.
                    </h1>
                    <p className="mt-5 text-lg" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                        Questions, feedback, or a bug to report? Reach out through any of these.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Surface elevation={1} className="p-6 flex flex-col">
                        <span className="cc-icon-well w-10 h-10 text-lime-300 inline-flex" aria-hidden="true">
                            <HugeiconsIcon icon={Mail01Icon} size={20} />
                        </span>
                        <h3 className="mt-4 text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>Email</h3>
                        <p className="mt-2 text-sm flex-1" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                            Send a message and we will get back to you.
                        </p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className="mt-4 inline-block">
                            <Button variant="secondary" size="md">{CONTACT_EMAIL}</Button>
                        </a>
                    </Surface>

                    <Surface elevation={1} className="p-6 flex flex-col">
                        <span className="cc-icon-well w-10 h-10 text-lime-300 inline-flex" aria-hidden="true">
                            <HugeiconsIcon icon={BugIcon} size={20} />
                        </span>
                        <h3 className="mt-4 text-base font-bold" style={{ color: 'var(--cc-tx-1)' }}>Report an issue</h3>
                        <p className="mt-2 text-sm flex-1" style={{ color: 'var(--cc-tx-2)', lineHeight: 1.6 }}>
                            Found a bug or have a feature request? Open an issue on GitHub.
                        </p>
                        <a href={REPO_URL} target="_blank" rel="noreferrer" className="mt-4 inline-block">
                            <Button variant="secondary" size="md">
                                GitHub <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
                            </Button>
                        </a>
                    </Surface>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm" style={{ color: 'var(--cc-tx-2)' }}>
                        Or skip the wait and just start playing.
                    </p>
                    <Button size="lg" className="mt-3" onClick={() => navigate('/arena')}>
                        Open the Bug Arena
                    </Button>
                </div>
            </div>
        </div>
    );
};
