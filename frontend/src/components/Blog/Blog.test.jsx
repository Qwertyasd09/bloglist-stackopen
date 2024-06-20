import { render, screen } from "@testing-library/react";
import Blog from "./Blog";
import userEvent from "@testing-library/user-event";

describe("<Blog />", () => {
  let container;
  let blog, userBlog, mockHandler;
  beforeEach(() => {
    userBlog = {
      name: "Diego Chiri",
      username: "dgchiri",
    };

    blog = {
      title: "Component testing is done with react-testing-library",
      author: "Diego",
      url: "wwww.google.com",
      likes: 2,
      user: userBlog,
    };
    mockHandler = vi.fn();
    container = render(
      <Blog blog={blog} user={userBlog} updateBlog={mockHandler} />,
    ).container;
  });

  test("renders blog's title and author but does not render URL and number of likes", () => {
    const outerBlogDiv = container.querySelector(".blog");
    const notVisibleBlog = container.querySelector(".notVisibleByDefault");
    expect(outerBlogDiv).toHaveTextContent(
      "Component testing is done with react-testing-library",
      "Diego",
    );
    expect(notVisibleBlog).toHaveStyle("display: none");
  });

  test("renders blog's URL and number of likes when button 'show' clicked", async () => {
    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);

    const notVisibleBlog = container.querySelector(".notVisibleByDefault");
    expect(notVisibleBlog).toHaveStyle("display: block");
    expect(notVisibleBlog).toHaveTextContent("wwww.google.com", "likes 2");
  });

  test("clicking two times add button calls event handler twice", async () => {
    const user = userEvent.setup();
    const button = screen.getByText("view");
    await user.click(button);
    const likeButton = screen.getByText("add");
    await user.dblClick(likeButton);
    expect(mockHandler.mock.calls).toHaveLength(2);
  });
});
