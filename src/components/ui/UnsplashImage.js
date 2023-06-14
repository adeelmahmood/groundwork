const PhotoComp = ({ photo }) => {
    const { user, urls } = photo;
    const selected = urls.regular === bannerImage;

    return (
        <Fragment>
            <div>
                <div
                    className={`relative rounded-lg border-8 pb-2/3 ${
                        selected && "rounded-lg border-8 border-green-500"
                    }`}
                >
                    <img
                        className="absolute h-full w-full object-cover object-center hover:cursor-pointer"
                        src={urls.regular}
                        onClick={() => {
                            if (bannerImage == urls.regular) {
                                setBannerImage(null);
                                setBannerImageMetadata({});
                            } else {
                                setBannerImage(urls.regular);
                                setBannerImageMetadata({
                                    photoCreditLink: `https://unsplash.com/@${user.username}?utm_source=${appName}&utm_medium=referral`,
                                    artistName: user.name,
                                });
                            }
                        }}
                    />
                    {selected && (
                        <CheckBadgeIcon className="absolute -top-5 -left-5 inline h-6 fill-current text-teal-600" />
                    )}
                </div>
                <a
                    className="text-sm text-gray-600"
                    target="_blank"
                    href={`https://unsplash.com/@${user.username}?utm_source=${appName}&utm_medium=referral`}
                >
                    by {user.name}
                </a>
            </div>
        </Fragment>
    );
};

export default PhotoComp;
